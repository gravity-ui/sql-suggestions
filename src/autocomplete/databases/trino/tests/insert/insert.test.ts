import {parseTrinoQueryWithCursor, parseTrinoQueryWithoutCursor} from '../../index';
import {
    ColumnSuggestion,
    KeywordSuggestion,
    TableOrViewSuggestion,
} from '../../../../shared/autocomplete-types';

test('should suggest properly after INSERT', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('INSERT |');

    const keywordsSuggestion: KeywordSuggestion[] = [{value: 'INTO'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after INTO', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('INSERT INTO |');

    const keywordsSuggestion: KeywordSuggestion[] = [];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables after INSERT INTO between statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'ALTER TABLE catalog.schema.before_table DROP COLUMN id; INSERT INTO | ; ALTER TABLE catalog.schema.after_table DROP COLUMN id;',
    );

    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest properly after table name', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('INSERT INTO catalog.schema.test_table |');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'AS'},
        {value: 'WITH'},
        {value: 'SELECT'},
        {value: 'TABLE'},
        {value: 'VALUES'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after VALUES', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'INSERT INTO catalog.schema.test_table VALUES |',
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

test('should suggest properly after VALUES with a bracket', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'INSERT INTO catalog.schema.test_table VALUES ( |',
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
        {value: 'WITH'},
        {value: 'SELECT'},
        {value: 'TABLE'},
        {value: 'VALUES'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after VALUES with a bracket after a value', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'INSERT INTO catalog.schema.test_table VALUES ("test", |',
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

test('should suggest properly after VALUES contents', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'INSERT INTO catalog.schema.test_table VALUES ("test") | ',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'AT'},
        {value: '*'},
        {value: 'OR'},
        {value: 'AND'},
        {value: 'NOT'},
        {value: 'BETWEEN'},
        {value: 'IN'},
        {value: 'LIKE'},
        {value: 'IS'},
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

test('should suggest properly after table name with a bracket', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'INSERT INTO catalog.schema.test_table( | ',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'SELECT'},
        {value: 'TABLE'},
        {value: 'VALUES'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);

    const columnSuggestion: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
});

test('should suggest table name for column between statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'ALTER TABLE catalog.schema.before_table DROP COLUMN id; INSERT INTO catalog.schema.test_table(| ; ALTER TABLE catalog.schema.after_table DROP COLUMN id',
    );

    const columnSuggestion: ColumnSuggestion = {tables: [{name: 'catalog.schema.test_table'}]};
    expect(autocompleteResult.suggestColumns).toEqual(columnSuggestion);
});

test('should suggest properly after the first column', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'INSERT INTO catalog.schema.test_table(test_column, | ',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should suggest properly after table with columns', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'INSERT INTO catalog.schema.test_table(test_column) | ',
    );

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'WITH'},
        {value: 'SELECT'},
        {value: 'TABLE'},
        {value: 'VALUES'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
});

test('should not report errors', () => {
    const autocompleteResult = parseTrinoQueryWithoutCursor(
        'INSERT INTO catalog.schema.test_table(id) VALUES(1)',
    );

    expect(autocompleteResult.errors).toHaveLength(0);
});
