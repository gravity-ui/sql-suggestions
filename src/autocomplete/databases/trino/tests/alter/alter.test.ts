import {KeywordSuggestion, TableOrViewSuggestion} from '../../../../shared/autocomplete-types';
import {parseTrinoQueryWithCursor} from '../../index';

test('should suggest keywords after ALTER', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('ALTER |');
    const keywords: KeywordSuggestion[] = [
        {value: 'VIEW'},
        {value: 'MATERIALIZED'},
        {value: 'TABLE'},
        {value: 'SCHEMA'},
    ];

    expect(autocompleteResult.suggestKeywords).toEqual(keywords);
});

test('should suggest VIEW after ALTER MATERIALIZED', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('ALTER MATERIALIZED |');
    const keywords: KeywordSuggestion[] = [{value: 'VIEW'}];

    expect(autocompleteResult.suggestKeywords).toEqual(keywords);
});

test('should suggest views after ALTER MATERIALIZED VIEW', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('ALTER MATERIALIZED VIEW |');

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest keywords after TABLE', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('ALTER TABLE |');

    const keywords: KeywordSuggestion[] = [{value: 'IF'}];
    expect(autocompleteResult.suggestKeywords).toEqual(keywords);

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables after ALTER TABLE between statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'DROP VIEW catalog.schema.before_view; ALTER TABLE | ; DROP VIEW catalog.schema.after_view;',
    );

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest keywords after TABLE 2', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('ALTER TABLE catalog.schema.test_table |');

    const keywords: KeywordSuggestion[] = [
        {value: 'EXECUTE'},
        {value: 'SET'},
        {value: 'ALTER'},
        {value: 'DROP'},
        {value: 'RENAME'},
        {value: 'ADD'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywords);
});

test('should suggest tables after ALTER VIEW', () => {
    const autocompleteResult = parseTrinoQueryWithCursor('ALTER VIEW |');

    const keywords: KeywordSuggestion[] = [];
    expect(autocompleteResult.suggestKeywords).toEqual(keywords);

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});

test('should suggest tables after ALTER VIEW between statements', () => {
    const autocompleteResult = parseTrinoQueryWithCursor(
        'ALTER TABLE catalog.schema.before_table DROP COLUMN id; ALTER VIEW | ; ALTER TABLE catalog.schema.after_table DROP COLUMN id;',
    );

    // TODO-TRINO: decouple views from tables
    expect(autocompleteResult.suggestViewsOrTables).toEqual(TableOrViewSuggestion.ALL);
});
