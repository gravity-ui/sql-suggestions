import * as c3 from 'antlr4-c3';
import {type TokenStream} from 'antlr4ng';
import {YQLParser} from './generated/YQLParser';
import {type TokenDictionary, getPreviousToken} from '../../shared/tables';
import {EntitySuggestion, InternalSuggestions, YQLEntity} from './types';

export const tokenDictionary: TokenDictionary = {
    SPACE: YQLParser.WS,
    FROM: YQLParser.FROM,
    OPENING_BRACKET: YQLParser.LPAREN,
    CLOSING_BRACKET: YQLParser.RPAREN,
    ALTER: YQLParser.ALTER,
    INSERT: YQLParser.INSERT,
    UPSERT: YQLParser.UPSERT,
    UPDATE: YQLParser.UPDATE,
    JOIN: YQLParser.JOIN,
    SEMICOLON: YQLParser.SEMICOLON,
    SELECT: YQLParser.SELECT,
};

type AnyRuleInList = (rules: number | number[]) => boolean;
type AllRulesInList = (rules: number[]) => boolean;

function isFirstPreviousTokenOfType(
    tokenStream: TokenStream,
    dictionary: TokenDictionary,
    tokenIndex: number,
    tokenType: number,
): boolean {
    let currentIndex = tokenIndex - 1;
    let token;

    do {
        token = tokenStream.get(currentIndex);
        if (token?.type === tokenType) {
            return true;
        }
        currentIndex--;
    } while (token?.type === dictionary.SPACE);

    return false;
}

export function checkShouldSuggestKeywords(
    cursorTokenIndex: number,
    tokenStream: TokenStream,
): boolean {
    return tokenStream.get(cursorTokenIndex)?.type !== YQLParser.ID_QUOTED;
}

function getRuleCheckHelpers(ruleList: c3.RuleList): {
    anyRuleInList: AnyRuleInList;
    allRulesInList: AllRulesInList;
} {
    const ruleMap = new Map(ruleList.map((rule) => [rule, true]));
    return {
        anyRuleInList: (rules: number | number[]): boolean => {
            const normalizedRules = Array.isArray(rules) ? rules : [rules];
            return normalizedRules.some((rule) => ruleMap.has(rule));
        },
        allRulesInList: (rules: number[]): boolean => !rules.some((rule) => !ruleMap.has(rule)),
    };
}

interface GetParticularSuggestionProps {
    anyRuleInList: AnyRuleInList;
    allRulesInList: AllRulesInList;
    cursorTokenIndex: number;
    tokenStream: TokenStream;
}

function getWindowFunctionsSuggestions({
    anyRuleInList,
    allRulesInList,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!allRulesInList([YQLParser.RULE_select_kind_partial, YQLParser.RULE_id_expr])) {
        return;
    }
    const noWindowFunction = anyRuleInList([
        YQLParser.RULE_window_specification_details,
        YQLParser.RULE_group_by_clause,
        YQLParser.RULE_table_ref,
        YQLParser.RULE_where_expr,
    ]);
    if (!noWindowFunction) {
        return true;
    }
    return;
}

function getObjectSuggestions({anyRuleInList}: GetParticularSuggestionProps): boolean | undefined {
    return (
        anyRuleInList([YQLParser.RULE_alter_object_stmt, YQLParser.RULE_drop_object_stmt]) &&
        anyRuleInList(YQLParser.RULE_id_or_at)
    );
}

function getTablestoreSuggestions({
    anyRuleInList,
    tokenStream,
    cursorTokenIndex,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList(YQLParser.RULE_id_or_at)) {
        return;
    }

    const tableStoreInDropTable =
        anyRuleInList(YQLParser.RULE_drop_table_stmt) &&
        Boolean(
            getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.TABLESTORE),
        );

    return anyRuleInList(YQLParser.RULE_alter_table_store_stmt) || tableStoreInDropTable;
}

function getTableSuggestions({
    anyRuleInList,
    allRulesInList,
    tokenStream,
    cursorTokenIndex,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList([YQLParser.RULE_id_or_at, YQLParser.RULE_id_table_or_type])) {
        return;
    }
    const isTargetForReplication =
        anyRuleInList(YQLParser.RULE_replication_target) &&
        !anyRuleInList(YQLParser.RULE_replication_name);

    const isExistingTableInSimpleTableRef =
        allRulesInList([YQLParser.RULE_simple_table_ref]) &&
        !getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.CREATE) &&
        !getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.EXTERNAL);

    return (
        anyRuleInList([YQLParser.RULE_table_ref, YQLParser.RULE_table_inherits]) ||
        isExistingTableInSimpleTableRef ||
        isTargetForReplication
    );
}

function getUserSuggestions({
    anyRuleInList,
    tokenStream,
    cursorTokenIndex,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList(YQLParser.RULE_role_name)) {
        return;
    }

    const hasPreviousTokenUser = Boolean(
        getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.USER),
    );

    const hasPreviousTokenRename = Boolean(
        getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.RENAME),
    );

    const userInRevokePermissions = anyRuleInList(YQLParser.RULE_revoke_permissions_stmt);

    const userInAlterGroup =
        anyRuleInList(YQLParser.RULE_alter_group_stmt) &&
        !hasPreviousTokenRename &&
        hasPreviousTokenUser;

    const userInCreateGroup =
        anyRuleInList(YQLParser.RULE_create_group_stmt) && hasPreviousTokenUser;

    const userInAlterUser =
        anyRuleInList(YQLParser.RULE_alter_user_stmt) && !hasPreviousTokenRename;

    const userInDropRole = anyRuleInList(YQLParser.RULE_drop_role_stmt) && hasPreviousTokenUser;

    return (
        userInDropRole ||
        userInAlterUser ||
        userInCreateGroup ||
        userInAlterGroup ||
        userInRevokePermissions
    );
}

function getGroupSuggestions({
    anyRuleInList,
    tokenStream,
    cursorTokenIndex,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList(YQLParser.RULE_role_name)) {
        return;
    }

    const hasPreviousTokenGroup = Boolean(
        getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.GROUP),
    );
    const hasPreviousTokenUser = Boolean(
        getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.USER),
    );

    const hasPreviousTokenRename = Boolean(
        getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.RENAME),
    );

    const groupInDropRole = anyRuleInList(YQLParser.RULE_drop_role_stmt) && hasPreviousTokenGroup;

    const groupInAlterGroup =
        anyRuleInList(YQLParser.RULE_alter_group_stmt) &&
        !hasPreviousTokenRename &&
        !hasPreviousTokenUser;

    return (
        anyRuleInList(YQLParser.RULE_revoke_permissions_stmt) ||
        groupInAlterGroup ||
        groupInDropRole
    );
}

function getTopicSuggestions({anyRuleInList}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList([YQLParser.RULE_an_id, YQLParser.RULE_topic_ref])) {
        return;
    }

    return anyRuleInList([YQLParser.RULE_drop_topic_stmt, YQLParser.RULE_alter_topic_stmt]);
}

function getViewSuggestions({allRulesInList}: GetParticularSuggestionProps): boolean | undefined {
    return (
        allRulesInList([YQLParser.RULE_drop_view_stmt, YQLParser.RULE_id_or_at]) ||
        allRulesInList([YQLParser.RULE_table_ref, YQLParser.RULE_id_table_or_type])
    );
}

function getReplicationSuggestions({
    anyRuleInList,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList(YQLParser.RULE_id_or_at)) {
        return;
    }

    return anyRuleInList([
        YQLParser.RULE_alter_replication_stmt,
        YQLParser.RULE_drop_replication_stmt,
    ]);
}

function getExternalTableSuggestions({
    allRulesInList,
    tokenStream,
    cursorTokenIndex,
}: GetParticularSuggestionProps): boolean | undefined {
    const hasPreviousTokenExternal = Boolean(
        getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.EXTERNAL),
    );

    const externalTableInDropTable =
        allRulesInList([YQLParser.RULE_id_or_at, YQLParser.RULE_drop_table_stmt]) &&
        hasPreviousTokenExternal;
    return (
        externalTableInDropTable ||
        allRulesInList([YQLParser.RULE_table_ref, YQLParser.RULE_id_table_or_type])
    );
}

function getExternalDatasourceSuggestions({
    anyRuleInList,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList(YQLParser.RULE_id_or_at)) {
        return;
    }
    return anyRuleInList([
        YQLParser.RULE_drop_external_data_source_stmt,
        YQLParser.RULE_alter_external_data_source_stmt,
    ]);
}

function checkShouldSuggestTableIndexes({anyRuleInList}: GetParticularSuggestionProps): boolean {
    if (!anyRuleInList(YQLParser.RULE_an_id)) {
        return false;
    }

    return anyRuleInList([
        YQLParser.RULE_alter_table_drop_index,
        YQLParser.RULE_alter_table_rename_index_to,
    ]);
}

function checkShouldSuggestColumns({
    anyRuleInList,
    tokenStream,
    cursorTokenIndex,
}: GetParticularSuggestionProps): boolean {
    if (
        !anyRuleInList([YQLParser.RULE_an_id, YQLParser.RULE_id_expr]) ||
        anyRuleInList([
            YQLParser.RULE_table_ref,
            YQLParser.RULE_values_stmt,
            YQLParser.RULE_alter_table_add_column,
            YQLParser.RULE_lambda_stmt,
        ])
    ) {
        return false;
    }

    const existingColumnInSelect =
        anyRuleInList(YQLParser.RULE_select_kind) &&
        !getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.LIMIT);

    const existingColumnInAlterTableAlterColumn =
        anyRuleInList(YQLParser.RULE_alter_table_alter_column) &&
        !getPreviousToken(tokenStream, tokenDictionary, cursorTokenIndex, YQLParser.FAMILY);

    return (
        anyRuleInList([
            YQLParser.RULE_pure_column_list,
            YQLParser.RULE_pure_column_or_named,
            YQLParser.RULE_column_name,
            YQLParser.RULE_without_column_name,
            YQLParser.RULE_alter_table_drop_column,
            YQLParser.RULE_delete_stmt,
        ]) ||
        existingColumnInAlterTableAlterColumn ||
        existingColumnInSelect
    );
}

function checkShouldSuggestAllColumns(props: GetParticularSuggestionProps): boolean {
    const shouldSuggestColumns = checkShouldSuggestColumns(props);
    if (!shouldSuggestColumns) {
        return false;
    }
    const {tokenStream, cursorTokenIndex, anyRuleInList, allRulesInList} = props;
    const isIntoTable =
        anyRuleInList([YQLParser.RULE_into_table_stmt, YQLParser.RULE_into_table_stmt_yq]) &&
        anyRuleInList(YQLParser.RULE_into_values_source);
    if (isIntoTable) {
        return isFirstPreviousTokenOfType(
            tokenStream,
            tokenDictionary,
            cursorTokenIndex,
            YQLParser.LPAREN,
        );
    }

    const isSelect = allRulesInList([
        YQLParser.RULE_select_kind_partial,
        YQLParser.RULE_result_column,
    ]);
    if (isSelect) {
        return isFirstPreviousTokenOfType(
            tokenStream,
            tokenDictionary,
            cursorTokenIndex,
            YQLParser.SELECT,
        );
    }
    return false;
}

function checkShouldSuggestVariables({
    anyRuleInList,
}: GetParticularSuggestionProps): boolean | undefined {
    return anyRuleInList([
        YQLParser.RULE_expr,
        YQLParser.RULE_table_ref,
        YQLParser.RULE_simple_table_ref_core,
        YQLParser.RULE_pure_column_or_named,
        YQLParser.RULE_using_call_expr,
    ]);
}

function getSimpleTypesSuggestions({
    anyRuleInList,
    allRulesInList,
}: GetParticularSuggestionProps): boolean | undefined {
    const simpleTypeInExpression =
        allRulesInList([YQLParser.RULE_id_expr, YQLParser.RULE_select_kind_partial]) &&
        !anyRuleInList(YQLParser.RULE_table_ref);
    return anyRuleInList(YQLParser.RULE_type_name_simple) || simpleTypeInExpression;
}

function getPragmasSuggestions({
    allRulesInList,
}: GetParticularSuggestionProps): boolean | undefined {
    return allRulesInList([YQLParser.RULE_an_id, YQLParser.RULE_pragma_stmt]);
}

function getUdfsSuggestions({anyRuleInList}: GetParticularSuggestionProps): boolean | undefined {
    if (
        !anyRuleInList([YQLParser.RULE_atom_expr, YQLParser.RULE_in_atom_expr]) ||
        anyRuleInList(YQLParser.RULE_table_ref)
    ) {
        return;
    }
    return anyRuleInList(YQLParser.RULE_select_kind_partial);
}

function getTableFunctionsSuggestions({
    allRulesInList,
}: GetParticularSuggestionProps): boolean | undefined {
    return allRulesInList([YQLParser.RULE_id_expr, YQLParser.RULE_table_ref]);
}

function getFunctionsSuggestions({
    anyRuleInList,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!anyRuleInList(YQLParser.RULE_id_expr) || anyRuleInList(YQLParser.RULE_table_ref)) {
        return;
    }
    return anyRuleInList(YQLParser.RULE_select_kind_partial);
}

function getAggregateFunctionsSuggestions({
    anyRuleInList,
    allRulesInList,
}: GetParticularSuggestionProps): boolean | undefined {
    if (!allRulesInList([YQLParser.RULE_select_kind_partial, YQLParser.RULE_id_expr])) {
        return;
    }
    const noAggregateFunction = anyRuleInList([
        YQLParser.RULE_group_by_clause,
        YQLParser.RULE_table_ref,
        YQLParser.RULE_where_expr,
    ]);
    if (!noAggregateFunction) {
        return true;
    }
    return;
}

function checkShouldSuggestTableHints({allRulesInList}: GetParticularSuggestionProps): boolean {
    return allRulesInList([YQLParser.RULE_an_id_hint, YQLParser.RULE_table_hint]);
}

function getEntitySettingsSuggestions({
    allRulesInList,
    anyRuleInList,
}: GetParticularSuggestionProps): YQLEntity | undefined {
    if (
        anyRuleInList([
            YQLParser.RULE_table_setting_value,
            YQLParser.RULE_topic_setting_value,
            YQLParser.RULE_topic_consumer_setting_value,
        ])
    ) {
        return;
    }
    if (allRulesInList([YQLParser.RULE_with_table_settings, YQLParser.RULE_an_id])) {
        if (anyRuleInList(YQLParser.RULE_create_external_data_source_stmt)) {
            return 'externalDataSource';
        }
        if (anyRuleInList(YQLParser.RULE_create_view_stmt)) {
            return 'view';
        }
        if (anyRuleInList(YQLParser.RULE_create_table_stmt)) {
            return 'table';
        }
        return;
    }
    if (allRulesInList([YQLParser.RULE_with_topic_settings, YQLParser.RULE_an_id])) {
        return 'topic';
    }
    if (allRulesInList([YQLParser.RULE_topic_consumer_with_settings, YQLParser.RULE_an_id])) {
        return 'topicConsumer';
    }
    if (allRulesInList([YQLParser.RULE_replication_settings, YQLParser.RULE_an_id])) {
        return 'replication';
    }
    return;
}

const ruleNames = YQLParser.ruleNames;

export function getParticularStatement(ruleList: c3.RuleList): string | undefined {
    const coreStatementIndex = ruleList.findIndex(
        (el) => el === YQLParser.RULE_sql_stmt_core || el === YQLParser.RULE_sql_stmt_core_yq,
    );
    if (coreStatementIndex === -1) {
        return undefined;
    }
    const particularStatementIndex = coreStatementIndex + 1;
    const particularStatement = ruleList[particularStatementIndex];
    if (!particularStatement) {
        return undefined;
    }
    return ruleNames[particularStatement];
}

export const EntitySuggestionToYqlEntity: Record<EntitySuggestion, YQLEntity> = {
    suggestObject: 'object',
    suggestTableStore: 'tableStore',
    suggestTable: 'table',
    suggestExternalTable: 'externalTable',
    suggestExternalDatasource: 'externalDataSource',
    suggestTopic: 'topic',
    suggestView: 'view',
    suggestReplication: 'replication',
    suggestGroup: 'group',
    suggestUser: 'user',
};

export function getGranularSuggestions(
    ruleList: c3.RuleList,
    cursorTokenIndex: number,
    tokenStream: TokenStream,
): InternalSuggestions {
    const getters = getRuleCheckHelpers(ruleList);
    const props = {...getters, cursorTokenIndex, tokenStream};

    const suggestWindowFunctions = getWindowFunctionsSuggestions(props);
    const suggestObject = getObjectSuggestions(props);
    const suggestTableStore = getTablestoreSuggestions(props);
    const suggestTable = getTableSuggestions(props);
    const suggestUser = getUserSuggestions(props);
    const suggestGroup = getGroupSuggestions(props);
    const suggestTopic = getTopicSuggestions(props);
    const suggestView = getViewSuggestions(props);
    const suggestReplication = getReplicationSuggestions(props);
    const suggestExternalTable = getExternalTableSuggestions(props);
    const suggestExternalDatasource = getExternalDatasourceSuggestions(props);
    const shouldSuggestTableIndexes = checkShouldSuggestTableIndexes(props);
    const shouldSuggestColumns = checkShouldSuggestColumns(props);
    const shouldSuggestAllColumns = checkShouldSuggestAllColumns(props);
    const suggestSimpleTypes = getSimpleTypesSuggestions(props);
    const suggestPragmas = getPragmasSuggestions(props);
    const suggestUdfs = getUdfsSuggestions(props);
    const suggestTableFunctions = getTableFunctionsSuggestions(props);
    const suggestFunctions = getFunctionsSuggestions(props);
    const suggestAggregateFunctions = getAggregateFunctionsSuggestions(props);
    const shouldSuggestTableHints = checkShouldSuggestTableHints(props);
    const suggestEntitySettings = getEntitySettingsSuggestions(props);
    const shouldSuggestVariables = checkShouldSuggestVariables(props);

    return {
        suggestWindowFunctions,
        shouldSuggestTableIndexes,
        shouldSuggestColumns,
        shouldSuggestAllColumns,
        shouldSuggestColumnAliases: shouldSuggestColumns,
        shouldSuggestVariables,
        suggestSimpleTypes,
        suggestPragmas,
        suggestUdfs,
        suggestTableFunctions,
        suggestFunctions,
        suggestAggregateFunctions,
        suggestTableHints: shouldSuggestTableHints ? getParticularStatement(ruleList) : undefined,
        suggestEntitySettings,
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
}
