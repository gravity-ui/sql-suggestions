import {ParseTree, TokenStream} from 'antlr4ng';
import * as c3 from 'antlr4-c3';

import {
    AutocompleteData,
    AutocompleteResultBase,
    CursorPosition,
    ISymbolTableVisitor,
    ProcessVisitedRulesResult,
    TableOrViewSuggestion,
} from '../../shared/autocomplete-types.js';
import {TrinoLexer} from './generated/TrinoLexer.js';
import {
    SelectItemContext,
    TableReferenceContext,
    TrinoParser,
    ViewIdentifierContext,
} from './generated/TrinoParser.js';
import {
    ColumnAliasSymbol,
    TableQueryPosition,
    TableSymbol,
    TokenDictionary,
    getContextSuggestions,
    isStartingToWriteRule,
    shouldSuggestTemplates,
} from '../../shared';
import {TrinoAutocompleteResult} from './index.js';
import {TrinoParserVisitor} from './generated/TrinoParserVisitor.js';

class TrinoSymbolTableVisitor extends TrinoParserVisitor<{}> implements ISymbolTableVisitor {
    symbolTable: c3.SymbolTable;
    scope: c3.ScopedSymbol;

    constructor() {
        super();
        this.symbolTable = new c3.SymbolTable('', {allowDuplicateSymbols: true});
        this.scope = this.symbolTable.addNewSymbolOfType(c3.ScopedSymbol, undefined);
    }

    visitTableReference = (context: TableReferenceContext): {} => {
        try {
            this.symbolTable.addNewSymbolOfType(
                TableSymbol,
                this.scope,
                context.tableIdentifier()?.getText() || '',
                context.aliasIdentifier()?.getText(),
            );
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };

    visitSelectItem = (context: SelectItemContext): {} => {
        try {
            const alias = context.aliasIdentifier()?.getText();
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

    visitViewIdentifier = (context: ViewIdentifierContext): {} => {
        try {
            this.symbolTable.addNewSymbolOfType(TableSymbol, this.scope, context.getText());
        } catch (error) {
            if (!(error instanceof c3.DuplicateSymbolError)) {
                throw error;
            }
        }

        return this.visitChildren(context) as {};
    };
}

const tokenDictionary: TokenDictionary = {
    SPACE: TrinoParser.WS_,
    FROM: TrinoParser.FROM_,
    OPENING_BRACKET: TrinoParser.LPAREN_,
    CLOSING_BRACKET: TrinoParser.RPAREN_,
    ALTER: TrinoParser.ALTER_,
    INSERT: TrinoParser.INSERT_,
    UPDATE: TrinoParser.UPDATE_,
    JOIN: TrinoParser.JOIN_,
    SEMICOLON: TrinoParser.SEMICOLON_,
    SELECT: TrinoParser.SELECT_,
};

// These are keywords that we do not want to show in autocomplete
function getIgnoredTokens(): number[] {
    const tokens = [];

    const firstOperatorIndex = TrinoParser.EQ_;
    const lastOperatorIndex = TrinoParser.UNRECOGNIZED_;
    for (let i = firstOperatorIndex; i <= lastOperatorIndex; i++) {
        // We actually want Star to appear in autocomplete
        if (i !== TrinoParser.ASTERISK_) {
            tokens.push(i);
        }
    }

    tokens.push(TrinoParser.EOF);

    return tokens;
}

const ignoredTokens = new Set(getIgnoredTokens());

const rulesToVisit = new Set([
    TrinoParser.RULE_catalogIdentifier,
    TrinoParser.RULE_schemaIdentifier,
    TrinoParser.RULE_tableIdentifier,
    TrinoParser.RULE_viewIdentifier,
    TrinoParser.RULE_columnIdentifier,

    // We don't need to go inside of those rules, we already know that this is a identifier
    TrinoParser.RULE_identifier,
]);

function processVisitedRules(
    rules: c3.CandidatesCollection['rules'],
    cursorTokenIndex: number,
    _tokenStream: TokenStream,
): ProcessVisitedRulesResult<TrinoAutocompleteResult> {
    let suggestCatalogs: TrinoAutocompleteResult['suggestCatalogs'];
    let suggestSchemas: TrinoAutocompleteResult['suggestSchemas'];
    let suggestViewsOrTables: TrinoAutocompleteResult['suggestViewsOrTables'];
    let shouldSuggestColumns = false;

    for (const [ruleId, rule] of rules) {
        if (!isStartingToWriteRule(cursorTokenIndex, rule)) {
            continue;
        }

        switch (ruleId) {
            case TrinoParser.RULE_columnIdentifier: {
                shouldSuggestColumns = true;
                break;
            }
            case TrinoParser.RULE_catalogIdentifier: {
                suggestCatalogs = true;
                break;
            }
            case TrinoParser.RULE_schemaIdentifier: {
                suggestSchemas = true;
                break;
            }
            // TODO-TRINO: separate tables and views
            case TrinoParser.RULE_viewIdentifier:
            case TrinoParser.RULE_tableIdentifier: {
                suggestViewsOrTables = TableOrViewSuggestion.ALL;
                break;
            }
        }
    }

    return {
        suggestCatalogs,
        suggestSchemas,
        suggestViewsOrTables,
        shouldSuggestColumns,
    };
}

function getParseTree(
    parser: TrinoParser,
    type?: TableQueryPosition['type'] | 'select',
): ParseTree {
    switch (type) {
        case 'from':
            return parser.fromClause();
        case 'insert':
            return parser.insertStatement();
        case 'update':
            return parser.updateStatement();
        case 'select':
            return parser.statement();
        default:
            return parser.parse();
    }
}

function enrichAutocompleteResult(
    baseResult: AutocompleteResultBase,
    rules: c3.CandidatesCollection['rules'],
    tokenStream: TokenStream,
    cursorTokenIndex: number,
    cursor: CursorPosition,
    query: string,
): TrinoAutocompleteResult {
    const {shouldSuggestColumns: contextSuggestionsNeeded, ...suggestionsFromRules} =
        processVisitedRules(rules, cursorTokenIndex, tokenStream);
    const suggestTemplates = shouldSuggestTemplates(query, cursor);

    const result: TrinoAutocompleteResult = {
        ...baseResult,
        ...suggestionsFromRules,
        suggestTemplates,
        suggestDatabases: undefined,
    };

    if (contextSuggestionsNeeded) {
        const visitor = new TrinoSymbolTableVisitor();
        const {tableContextSuggestion, suggestColumnAliases} = getContextSuggestions(
            TrinoLexer,
            TrinoParser,
            visitor,
            tokenDictionary,
            getParseTree,
            tokenStream,
            cursor,
            query,
            true,
        );

        if (tableContextSuggestion) {
            result.suggestColumns = tableContextSuggestion;
        }
        if (suggestColumnAliases) {
            result.suggestColumnAliases = suggestColumnAliases;
        }
    }

    return result;
}

export const trinoAutocompleteData: AutocompleteData<
    TrinoAutocompleteResult,
    TrinoLexer,
    TrinoParser
> = {
    Lexer: TrinoLexer,
    Parser: TrinoParser,
    tokenDictionary,
    ignoredTokens,
    rulesToVisit,
    getParseTree,
    enrichAutocompleteResult,
};
