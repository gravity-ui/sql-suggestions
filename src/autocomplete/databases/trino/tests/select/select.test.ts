import {parseTrinoQueryWithCursor, parseTrinoQueryWithoutCursor} from '../../index';
import {
    ColumnSuggestion,
    KeywordSuggestion,
    TableOrViewSuggestion,
} from '../../../../shared/autocomplete-types';

test('should suggest properly after SELECT', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('SELECT |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: '*'},
        {value: 'NULL'},
        {value: 'INTERVAL'},
        {value: 'DOUBLE'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'POSITION'},
        {value: 'ROW'},
        {value: 'LISTAGG'},
        {value: 'FINAL'},
        {value: 'RUNNING'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'CAST'},
        {value: 'TRY_CAST'},
        {value: 'ARRAY'},
        {value: 'CURRENT_DATE'},
        {value: 'CURRENT_TIME'},
        {value: 'CURRENT_TIMESTAMP'},
        {value: 'LOCALTIME'},
        {value: 'LOCALTIMESTAMP'},
        {value: 'CURRENT_USER'},
        {value: 'CURRENT_CATALOG'},
        {value: 'CURRENT_SCHEMA'},
        {value: 'CURRENT_PATH'},
        {value: 'TRIM'},
        {value: 'SUBSTRING'},
        {value: 'NORMALIZE'},
        {value: 'EXTRACT'},
        {value: 'GROUPING'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_QUERY'},
        {value: 'JSON_OBJECT'},
        {value: 'JSON_ARRAY'},
        {value: 'NOT'},
        {value: 'ALL'},
        {value: 'DISTINCT'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);

    // TODO-TRINO: support functions and aggregate functions
    // expect(autocompleteResult.suggestFunctions).toEqual(true);
    // expect(autocompleteResult.suggestAggregateFunctions).toEqual(true);

    expect(autocompleteResult.suggestTemplates).toEqual(false);
});

test('should suggest properly after *', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('SELECT * |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'WINDOW'},
        {value: 'HAVING'},
        {value: 'GROUP'},
        {value: 'WHERE'},
        {value: 'FROM'},
        {value: 'EXCEPT'},
        {value: 'UNION'},
        {value: 'INTERSECT'},
        {value: 'FETCH'},
        {value: 'LIMIT'},
        {value: 'OFFSET'},
        {value: 'ORDER'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after FROM', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('SELECT * FROM |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'UNNEST'},
        {value: 'LATERAL'},
        {value: 'TABLE'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest ALL tables between statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'ALTER TABLE catalog.schema.before_table DROP COLUMN id; SELECT * FROM | ; ALTER TABLE catalog.schema.after_table DROP COLUMN id;',
    );

    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables with inline comment', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM | --SELECT * FROM catalog.schema.test_table',
    );

    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables with multiline comment', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM | /*SELECT * FROM catalog.schema.test_table*/',
    );

    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest properly after table name', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM catalog.schema.test_table |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'FOR'},
        {value: 'AS'},
        {value: 'MATCH_RECOGNIZE'},
        {value: 'TABLESAMPLE'},
        {value: 'NATURAL'},
        {value: 'INNER'},
        {value: 'FULL'},
        {value: 'LEFT'},
        {value: 'RIGHT'},
        {value: 'JOIN'},
        {value: 'CROSS'},
        {value: 'WINDOW'},
        {value: 'HAVING'},
        {value: 'GROUP'},
        {value: 'WHERE'},
        {value: 'EXCEPT'},
        {value: 'UNION'},
        {value: 'INTERSECT'},
        {value: 'FETCH'},
        {value: 'LIMIT'},
        {value: 'OFFSET'},
        {value: 'ORDER'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest table name for column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('SELECT | FROM catalog.schema.test_table');
    const columnSuggestions: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name and alias for column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT | FROM catalog.schema.test_table t',
    );
    const columnSuggestions: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 't'}],
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name and alias (with AS) for column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT | FROM catalog.schema.test_table AS t',
    );
    const columnSuggestions: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 't'}],
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest table name and alias for second column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT id, | FROM catalog.schema.test_table AS t',
    );
    const columnSuggestions: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 't'}],
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest multiple table names for column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT | FROM catalog.schema.test_table_1, catalog.schema.test_table_2',
    );
    const columnSuggestions: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table_1'}, {name: 'catalog.schema.test_table_2'}],
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest multiple table names and aliases for column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT | FROM catalog.schema.test_table_1 t1, catalog.schema.test_table_2 t2',
    );
    const columnSuggestions: ColumnSuggestion = {
        tables: [
            {name: 'catalog.schema.test_table_1', alias: 't1'},
            {name: 'catalog.schema.test_table_2', alias: 't2'},
        ],
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest multiple table names and aliases (with AS) for column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT | FROM catalog.schema.test_table_1 AS t1, catalog.schema.test_table_2 AS t2',
    );
    const columnSuggestions: ColumnSuggestion = {
        tables: [
            {name: 'catalog.schema.test_table_1', alias: 't1'},
            {name: 'catalog.schema.test_table_2', alias: 't2'},
        ],
    };

    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestions);
});

test('should suggest properly after HAVING', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM catalog.schema.test_table as t HAVING |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'NULL'},
        {value: 'INTERVAL'},
        {value: 'DOUBLE'},
        {value: 'FALSE'},
        {value: 'TRUE'},
        {value: 'POSITION'},
        {value: 'ROW'},
        {value: 'LISTAGG'},
        {value: 'FINAL'},
        {value: 'RUNNING'},
        {value: 'EXISTS'},
        {value: 'CASE'},
        {value: 'CAST'},
        {value: 'TRY_CAST'},
        {value: 'ARRAY'},
        {value: 'CURRENT_DATE'},
        {value: 'CURRENT_TIME'},
        {value: 'CURRENT_TIMESTAMP'},
        {value: 'LOCALTIME'},
        {value: 'LOCALTIMESTAMP'},
        {value: 'CURRENT_USER'},
        {value: 'CURRENT_CATALOG'},
        {value: 'CURRENT_SCHEMA'},
        {value: 'CURRENT_PATH'},
        {value: 'TRIM'},
        {value: 'SUBSTRING'},
        {value: 'NORMALIZE'},
        {value: 'EXTRACT'},
        {value: 'GROUPING'},
        {value: 'JSON_EXISTS'},
        {value: 'JSON_VALUE'},
        {value: 'JSON_QUERY'},
        {value: 'JSON_OBJECT'},
        {value: 'JSON_ARRAY'},
        {value: 'NOT'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after LIMIT', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM catalog.schema.test_table as t LIMIT |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'ALL'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestColumns).toBeUndefined();
});

test('should suggest properly after OFFSET', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'SELECT * FROM catalog.schema.test_table as t OFFSET |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestColumns).toBeUndefined();
});

test('should not report errors', () => {
    const autocompleteResult = parseTrinoQueryWithoutCursor(
        'SELECT c1, c2 FROM catalog.schema.test_table',
    );

    expect(autocompleteResult.errors).toHaveLength(0);
});
