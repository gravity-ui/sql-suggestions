import {parseTrinoQueryWithCursor, parseTrinoQueryWithoutCursor} from '../../index';
import {
    ColumnSuggestion,
    KeywordSuggestion,
    TableOrViewSuggestion,
} from '../../../../shared/autocomplete-types';

test('should suggest properly after UPDATE', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('UPDATE |');

    expect(autocompleteResult.suggestKeywords).toEqual([]);
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables after UPDATE between statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'ALTER TABLE catalog.schema.before_table DROP COLUMN id; UPDATE | ; ALTER TABLE catalog.schema.after_table DROP COLUMN id;',
    );

    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest properly after table name', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('UPDATE catalog.schema.test_table |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'AS'}, {value: 'SET'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after SET', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('UPDATE catalog.schema.test_table SET |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'SET'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);

    // TODO-TRINO: fix SET being read as an alias
    const columnSuggestion: ColumnSuggestion = {
        tables: [{name: 'catalog.schema.test_table', alias: 'SET'}],
    };
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
});

// TODO-TRINO: Add multiple statements
// test('should suggest table name for column after SET between statements', () => {
//     const autocompleteResult = parseTrinoQueryWithCursor(
//         'ALTER TABLE before_table DROP COLUMN id; UPDATE catalog.schema.test_table SET | ; ALTER TABLE after_table DROP COLUMN id;',
//     );
//
//     const columnSuggestion: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};
//     expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
// });

test('should suggest properly after column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'UPDATE catalog.schema.test_table SET test_column |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after column equals', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'UPDATE catalog.schema.test_table SET test_column = |',
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

test('should suggest properly after the first column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'UPDATE catalog.schema.test_table SET test_column = "test" |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'OVER'},
        {value: 'AT'},
        {value: '*'},
        {value: 'OR'},
        {value: 'AND'},
        {value: 'NOT'},
        {value: 'BETWEEN'},
        {value: 'IN'},
        {value: 'LIKE'},
        {value: 'IS'},
        {value: 'WHERE'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest table name for second column after SET', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'UPDATE catalog.schema.test_table SET id = 1, |',
    );

    const columnSuggestion: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
});

// TODO-TRINO: support multiple statements
// test('should suggest table name for second column after SET between statements', () => {
//     const autocompleteResult = parseTrinoQueryWithCursor(
//         'ALTER TABLE before_table DROP COLUMN id; UPDATE catalog.schema.test_table SET id = 1, | ; ALTER TABLE after_table DROP COLUMN id;',
//     );
//     const columnSuggestion: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};

//     expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
// });

test('should suggest properly after WHERE', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'UPDATE catalog.schema.test_table SET test_column = "test" WHERE |',
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

    const columnSuggestion: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
});

// TODO-TRINO: support multiple statements
// test('should suggest table name for column after WHERE between statements', () => {
//     const autocompleteResult = parseTrinoQueryWithCursor(
//         'ALTER TABLE before_table DROP COLUMN id; UPDATE catalog.schema.test_table SET id = 1 WHERE | ; ALTER TABLE after_table DROP COLUMN id;',
//     );
//     const columnSuggestion: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};
//
//     expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
// });

test('should suggest properly after RETURNING', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'UPDATE catalog.schema.test_table SET test_column = "test" RETURNING |',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should not report errors', () => {
    const autocompleteResult = parseTrinoQueryWithoutCursor(
        'UPDATE catalog.schema.test_table SET id = 1 WHERE id = 1',
    );

    expect(autocompleteResult.errors).toHaveLength(0);
});
