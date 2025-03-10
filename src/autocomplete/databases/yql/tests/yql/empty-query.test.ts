import {KeywordSuggestion} from '../../../../shared/autocomplete-types';
import {parseYqlQueryWithCursor} from '../../index';

test('should suggest properly for an empty query', () => {
    const autocompleteResult = parseYqlQueryWithCursor('|');

    const keywordsSuggestion: KeywordSuggestion[] = [
        {value: 'EXPLAIN'},
        {value: 'PRAGMA'},
        {value: 'DISCARD'},
        {value: 'PROCESS'},
        {value: 'REDUCE'},
        {value: 'FROM'},
        {value: 'SELECT'},
        {value: 'CREATE'},
        {value: 'DROP'},
        {value: 'USE'},
        {value: 'INSERT'},
        {value: 'UPSERT'},
        {value: 'REPLACE'},
        {value: 'COMMIT'},
        {value: 'BATCH'},
        {value: 'UPDATE'},
        {value: 'DELETE'},
        {value: 'ROLLBACK'},
        {value: 'DECLARE'},
        {value: 'IMPORT'},
        {value: 'EXPORT'},
        {value: 'ALTER'},
        {value: 'DO'},
        {value: 'DEFINE'},
        {value: 'EVALUATE'},
        {value: 'IF'},
        {value: 'PARALLEL'},
        {value: 'FOR'},
        {value: 'VALUES'},
        {value: 'GRANT'},
        {value: 'REVOKE'},
        {value: 'ANALYZE'},
        {value: 'BACKUP'},
        {value: 'RESTORE'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordsSuggestion);
    expect(autocompleteResult.suggestTemplates).toEqual(true);
});
