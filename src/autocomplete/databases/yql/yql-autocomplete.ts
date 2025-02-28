import {ParseTree, TokenStream} from 'antlr4ng';
import * as c3 from 'antlr4-c3';

import {YQLLexer} from './generated/YQLLexer';
import {
    Action_or_subquery_argsContext,
    Alter_table_store_stmtContext,
    Declare_stmtContext,
    Define_action_or_subquery_stmtContext,
    LambdaContext,
    Named_columnContext,
    Named_exprContext,
    Named_nodes_stmtContext,
    Named_single_sourceContext,
    Result_columnContext,
    Select_coreContext,
    Select_stmtContext,
    Simple_table_ref_coreContext,
    Sql_queryContext,
    Sql_query_yqContext,
    Sql_stmt_coreContext,
    Sql_stmt_core_yqContext,
    YQLParser,
} from './generated/YQLParser';
import {YQLVisitor} from './generated/YQLVisitor';

import {
    AutocompleteData,
    AutocompleteResultBase,
    CursorPosition,
    GetParseTree,
    ISymbolTableVisitor,
    ProcessVisitedRulesResult,
} from '../../shared/autocomplete-types';
import {ColumnAliasSymbol, TableSymbol, VariableSymbol} from '../../shared/symbol-table.js';
import {isStartingToWriteRule} from '../../shared/cursor.js';
import {shouldSuggestTemplates} from '../../shared/query.js';
import {
    EntitySuggestionToYqlEntity,
    checkShouldSuggestKeywords,
    getGranularSuggestions,
    tokenDictionary,
} from './helpers';
import {EntitySuggestion, InternalSuggestions, YqlAutocompleteResult} from './types';
import {getVariableSuggestions} from '../../shared/variables';
import {getExtendedTableSuggestions} from '../../shared/extended-tables';

// These are keywords that we do not want to show in autocomplete
function getIgnoredTokens(): number[] {
    const tokens = [];

    const firstOperatorIndex = YQLParser.EQUALS;
    const lastOperatorIndex = YQLParser.LBRACE_SQUARE;
    for (let i = firstOperatorIndex; i <= lastOperatorIndex; i++) {
        // We actually want Star to appear in autocomplete
        if (i !== YQLParser.ASTERISK) {
            tokens.push(i);
        }
    }

    tokens.push(YQLParser.STREAM);
    tokens.push(YQLParser.STRING_VALUE);
    tokens.push(YQLParser.REAL);
    tokens.push(YQLParser.EOF);
    tokens.push(YQLParser.DIGITS);
    tokens.push(YQLParser.BLOB);
    tokens.push(YQLParser.CURRENT_TIME);
    tokens.push(YQLParser.CURRENT_DATE);
    tokens.push(YQLParser.CURRENT_TIMESTAMP);

    return tokens;
}

const ignoredTokens = new Set(getIgnoredTokens());

const rulesToVisit = new Set([
    YQLParser.RULE_id_or_type,
    YQLParser.RULE_cluster_expr,
    YQLParser.RULE_identifier,
    YQLParser.RULE_id,
    YQLParser.RULE_integer,
    YQLParser.RULE_type_id,

    YQLParser.RULE_keyword,
    YQLParser.RULE_keyword_compat,
    YQLParser.RULE_keyword_as_compat,
    YQLParser.RULE_keyword_expr_uncompat,
    YQLParser.RULE_keyword_table_uncompat,
    YQLParser.RULE_keyword_select_uncompat,
    YQLParser.RULE_keyword_alter_uncompat,
    YQLParser.RULE_keyword_in_uncompat,
    YQLParser.RULE_keyword_window_uncompat,
    YQLParser.RULE_keyword_hint_uncompat,

    YQLParser.RULE_id_schema,
    YQLParser.RULE_id_expr_in,
    YQLParser.RULE_id_window,
    YQLParser.RULE_id_table,
    YQLParser.RULE_id_without,
    YQLParser.RULE_id_hint,
    YQLParser.RULE_id_as_compat,
]);

class YQLSymbolTableVisitor extends YQLVisitor<{}> implements ISymbolTableVisitor {
    symbolTable: c3.SymbolTable;
    scope: c3.ScopedSymbol;

    constructor() {
        super();
        this.symbolTable = new c3.SymbolTable('', {allowDuplicateSymbols: true});
        this.scope = this.symbolTable.addNewSymbolOfType(c3.ScopedSymbol, undefined);
    }

    withScope<T>(
        tree: ParseTree,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: new (...args: any[]) => c3.ScopedSymbol,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: any[],
        action: () => T,
    ): T {
        const scope = this.symbolTable.addNewSymbolOfType(type, this.scope, ...args);
        scope.context = tree;
        this.scope = scope;
        try {
            return action();
        } finally {
            this.scope = scope.parent as c3.ScopedSymbol;
        }
    }

    getColumnsFromSelectCore(context: Select_coreContext): string[] | undefined {
        const columns = [];
        let i = 0;
        while (i >= 0) {
            const column = context?.result_column(i);
            if (!column) {
                i = -1;
                continue;
            }
            const columnAlias =
                column.an_id_as_compat()?.getText() || column.an_id_or_type()?.getText();
            if (columnAlias) {
                columns.push(columnAlias);
            } else {
                const columnName = column.expr()?.getText();
                if (columnName) {
                    columns.push(columnName);
                }
            }
            i += 1;
        }
        return columns.length ? columns : undefined;
    }

    protected defaultResult(): c3.SymbolTable {
        return this.symbolTable;
    }
}

class YQLVariableSymbolTableVisitor extends YQLSymbolTableVisitor {
    addVariableSymbol = (
        getVariable: (index: number) => string | undefined,
        variableValue?: unknown,
    ): void => {
        try {
            let index: number | null = 0;
            while (index !== null) {
                const variable = getVariable(index);
                if (variable) {
                    this.symbolTable.addNewSymbolOfType(
                        VariableSymbol,
                        this.scope,
                        variable,
                        variableValue,
                    );
                    index++;
                } else {
                    index = null;
                }
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }
    };

    visitDeclare_stmt = (context: Declare_stmtContext): {} => {
        try {
            const variable = context.bind_parameter()?.an_id_or_type()?.getText();
            if (variable) {
                const value = context.literal_value()?.getText();

                this.symbolTable.addNewSymbolOfType(VariableSymbol, this.scope, variable, value);
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };

    visitAction_or_subquery_args = (context: Action_or_subquery_argsContext): {} => {
        this.addVariableSymbol(
            (index: number) =>
                context.opt_bind_parameter(index)?.bind_parameter()?.an_id_or_type()?.getText(),
        );
        return this.visitChildren(context) as {};
    };

    visitNamed_nodes_stmt = (context: Named_nodes_stmtContext): {} => {
        const selectStmt =
            context.subselect_stmt()?.select_stmt()?.select_kind_parenthesis(0) ||
            context.subselect_stmt()?.select_unparenthesized_stmt();
        const selectCore = selectStmt?.select_kind_partial()?.select_kind()?.select_core();
        const columns = selectCore ? this.getColumnsFromSelectCore(selectCore) : undefined;
        this.addVariableSymbol(
            (index: number) =>
                context.bind_parameter_list()?.bind_parameter(index)?.an_id_or_type()?.getText(),
            columns ? {columns} : undefined,
        );

        return this.visitChildren(context) as {};
    };

    visitDefine_action_or_subquery_stmt = (context: Define_action_or_subquery_stmtContext): {} => {
        try {
            // This variable should be in global scope
            const variable = context.bind_parameter()?.an_id_or_type()?.getText();
            if (variable) {
                this.symbolTable.addNewSymbolOfType(
                    VariableSymbol,
                    this.scope,
                    variable,
                    undefined,
                );
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return (
            this.withScope(
                context,
                c3.RoutineSymbol,
                [context.bind_parameter()?.an_id_or_type()?.getText()],
                () => this.visitChildren(context),
            ) ?? {}
        );
    };

    visitLambda = (context: LambdaContext): {} => {
        // This variable should be in local scope, so it should be extracted inside withScope callback
        const addVariables = (): {} => {
            const lambdaArgs = context.smart_parenthesis()?.named_expr_list();
            this.addVariableSymbol((index: number) => {
                const variable = lambdaArgs?.named_expr(index)?.expr()?.getText();
                if (variable) {
                    if (variable.startsWith('$')) {
                        return variable.slice(1);
                    }
                }
                return;
            });
            return this.visitChildren(context) as {};
        };

        return this.withScope(context, c3.RoutineSymbol, [context.getText()], addVariables) ?? {};
    };
}

class YQLTableSymbolTableVisitor extends YQLSymbolTableVisitor {
    visitSql_stmt_core = (context: Sql_stmt_coreContext): {} => {
        return (
            this.withScope(context, c3.RoutineSymbol, [context.getText()], () =>
                this.visitChildren(context),
            ) ?? {}
        );
    };
    visitSelect_stmt = (context: Select_stmtContext): {} => {
        return (
            this.withScope(context, c3.RoutineSymbol, [context.getText()], () =>
                this.visitChildren(context),
            ) ?? {}
        );
    };
    visitSql_stmt_core_yq = (context: Sql_stmt_core_yqContext): {} => {
        return (
            this.withScope(context, c3.RoutineSymbol, [context.getText()], () =>
                this.visitChildren(context),
            ) ?? {}
        );
    };
    visitSimple_table_ref_core = (context: Simple_table_ref_coreContext): {} => {
        try {
            const table = context.object_ref()?.id_or_at()?.an_id_or_type()?.getText();
            if (table) {
                this.symbolTable.addNewSymbolOfType(TableSymbol, this.scope, table);
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };
    visitAlter_table_store_stmt = (context: Alter_table_store_stmtContext): {} => {
        try {
            const table = context.object_ref()?.id_or_at()?.getText();
            if (table) {
                this.symbolTable.addNewSymbolOfType(
                    TableSymbol,
                    this.scope,
                    context.object_ref()?.id_or_at()?.getText(),
                );
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };
    visitNamed_single_source = (context: Named_single_sourceContext): {} => {
        try {
            const tableName = context.single_source().table_ref()?.getText() ?? '';
            const sourceAlias = context.an_id()?.getText() ?? context.an_id_as_compat()?.getText();
            const selectCore = context
                .single_source()
                .select_stmt()
                ?.select_kind_parenthesis(0)
                ?.select_kind_partial()
                ?.select_kind()
                ?.select_core();
            const columns = selectCore ? this.getColumnsFromSelectCore(selectCore) : undefined;

            this.symbolTable.addNewSymbolOfType(
                TableSymbol,
                this.scope,
                tableName,
                sourceAlias,
                columns,
            );
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };
    visitNamed_column = (context: Named_columnContext): {} => {
        try {
            const alias = context.an_id()?.getText();

            if (alias) {
                this.symbolTable.addNewSymbolOfType(ColumnAliasSymbol, this.scope, alias);
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };
    visitNamed_expr = (context: Named_exprContext): {} => {
        try {
            const alias = context.an_id_or_type()?.getText();

            if (alias) {
                this.symbolTable.addNewSymbolOfType(ColumnAliasSymbol, this.scope, alias);
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };
    visitResult_column = (context: Result_columnContext): {} => {
        try {
            const alias =
                context.an_id_or_type()?.getText() ?? context.an_id_as_compat()?.getText();
            if (alias) {
                this.symbolTable.addNewSymbolOfType(ColumnAliasSymbol, this.scope, alias);
            }
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };
}

function processVisitedRules(
    rules: c3.CandidatesCollection['rules'],
    cursorTokenIndex: number,
    tokenStream: TokenStream,
): ProcessVisitedRulesResult<YqlAutocompleteResult> {
    let suggestionsResult: InternalSuggestions = {};
    for (const [ruleId, rule] of rules) {
        if (!isStartingToWriteRule(cursorTokenIndex, rule)) {
            break;
        }
        switch (ruleId) {
            case YQLParser.RULE_id_table:
            case YQLParser.RULE_id_hint:
            case YQLParser.RULE_identifier:
            case YQLParser.RULE_id_or_type:
            case YQLParser.RULE_id: {
                const internalSuggestionsResult = getGranularSuggestions(
                    rule.ruleList,
                    cursorTokenIndex,
                    tokenStream,
                );
                const truthySuggestion = Object.fromEntries(
                    Object.entries(internalSuggestionsResult).filter(([_key, value]) => value),
                );
                suggestionsResult = {...suggestionsResult, ...truthySuggestion};
            }
        }
    }

    const {
        suggestObject,
        suggestTableStore,
        suggestTable,
        suggestUser,
        suggestGroup,
        suggestTopic,
        suggestView,
        suggestReplication,
        suggestExternalTable,
        suggestExternalDatasource,
        ...restSuggestions
    } = suggestionsResult;

    const entitiesSuggestion = {
        suggestObject,
        suggestTableStore,
        suggestTable,
        suggestUser,
        suggestGroup,
        suggestTopic,
        suggestView,
        suggestReplication,
        suggestExternalTable,
        suggestExternalDatasource,
    };

    const suggestEntity: YqlAutocompleteResult['suggestEntity'] = Object.entries(entitiesSuggestion)
        .filter(([_key, value]) => value)
        .map(([key]) => EntitySuggestionToYqlEntity[key as EntitySuggestion]);

    return {suggestEntity: suggestEntity.length ? suggestEntity : undefined, ...restSuggestions};
}

function getParseTree(parser: YQLParser): ParseTree {
    return parser.sql_query();
}

function getParseTreeYQ(parser: YQLParser): ParseTree {
    return parser.sql_query_yq();
}

function getEnrichAutocompleteResult(parseTreeGetter: GetParseTree<YQLParser>) {
    return (
        baseResult: AutocompleteResultBase,
        rules: c3.CandidatesCollection['rules'],
        tokenStream: TokenStream,
        cursorTokenIndex: number,
        cursor: CursorPosition,
        query: string,
    ): YqlAutocompleteResult => {
        const {
            shouldSuggestColumns,
            shouldSuggestAllColumns,
            shouldSuggestColumnAliases,
            shouldSuggestTableIndexes,
            shouldSuggestVariables,
            ...suggestionsFromRules
        } = processVisitedRules(rules, cursorTokenIndex, tokenStream);
        const suggestTemplates = shouldSuggestTemplates(query, cursor);
        const result: YqlAutocompleteResult = {
            ...baseResult,
            ...suggestionsFromRules,
            suggestTemplates,
        };
        const contextSuggestionsNeeded =
            shouldSuggestColumns || shouldSuggestColumnAliases || shouldSuggestTableIndexes;

        if (shouldSuggestVariables) {
            const visitor = new YQLVariableSymbolTableVisitor();
            const data = getVariableSuggestions(
                YQLLexer,
                YQLParser,
                visitor,
                parseTreeGetter,
                tokenStream,
                cursor,
                query,
                [YQLParser.WS],
            );
            if (data.length) {
                result.suggestVariables = data;
            }
        }

        if (contextSuggestionsNeeded) {
            const visitor = new YQLTableSymbolTableVisitor();
            const {tableContextSuggestion, suggestColumnAliases} = getExtendedTableSuggestions(
                YQLLexer,
                YQLParser,
                visitor,
                parseTreeGetter,
                tokenStream,
                cursor,
                query,
                [YQLParser.WS],
            );

            if (shouldSuggestColumns && tableContextSuggestion) {
                result.suggestColumns = {
                    tables: tableContextSuggestion.tables,
                };
                if (shouldSuggestAllColumns) {
                    result.suggestColumns.all = true;
                }
            }
            if (shouldSuggestTableIndexes && tableContextSuggestion) {
                result.suggestTableIndexes = {tables: tableContextSuggestion.tables};
            }
            if (shouldSuggestColumnAliases && suggestColumnAliases) {
                result.suggestColumnAliases = suggestColumnAliases;
            }
        }

        if (!checkShouldSuggestKeywords(cursorTokenIndex, tokenStream)) {
            result.suggestKeywords = [];
        }

        return result;
    };
}

const yqlContext = new Sql_queryContext(null, -1);

export const yqlAutocompleteData: AutocompleteData<YqlAutocompleteResult, YQLLexer, YQLParser> = {
    Lexer: YQLLexer,
    Parser: YQLParser,
    tokenDictionary,
    ignoredTokens,
    rulesToVisit,
    getParseTree,
    enrichAutocompleteResult: getEnrichAutocompleteResult(getParseTree),
    context: yqlContext,
};

const yqContext = new Sql_query_yqContext(null, -1);

export const yqlAutocompleteDataYQ: AutocompleteData<YqlAutocompleteResult, YQLLexer, YQLParser> = {
    Lexer: YQLLexer,
    Parser: YQLParser,
    tokenDictionary,
    ignoredTokens,
    rulesToVisit,
    getParseTree: getParseTreeYQ,
    enrichAutocompleteResult: getEnrichAutocompleteResult(getParseTreeYQ),
    context: yqContext,
};
