import {parsePostgreSqlQueryWithCursor, parsePostgreSqlQueryWithoutCursor} from '../../index';
import {ConstraintSuggestion, KeywordSuggestion} from '../../../../shared/autocomplete-types';

test('should suggest view name after DROP CONSTRAINT', () => {
    const autocompleteResult = parsePostgreSqlQueryWithCursor(
        'ALTER TABLE test_table DROP CONSTRAINT |',
    );

    const constraintSuggestion: ConstraintSuggestion = {
        tables: [{name: 'test_table'}],
    };
    expect(autocompleteResult.suggestConstraints).toEqual(constraintSuggestion);

    const keywordSuggestion: KeywordSuggestion[] = [
        {value: 'IF'},
        {value: 'CASCADE'},
        {value: 'RESTRICT'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordSuggestion);
});

test('should suggest view name after DROP CONSTRAINT between statements', () => {
    const autocompleteResult = parsePostgreSqlQueryWithCursor(
        'ALTER TABLE before_table DROP COLUMN id; ALTER TABLE test_table DROP CONSTRAINT | ; ALTER TABLE after_table DROP COLUMN id;',
    );

    const constraintSuggestion: ConstraintSuggestion = {
        tables: [{name: 'test_table'}],
    };
    expect(autocompleteResult.suggestConstraints).toEqual(constraintSuggestion);

    const keywordSuggestion: KeywordSuggestion[] = [
        {value: 'IF'},
        {value: 'CASCADE'},
        {value: 'RESTRICT'},
    ];
    expect(autocompleteResult.suggestKeywords).toEqual(keywordSuggestion);
});

test('should not report an error of a full statement', () => {
    const autocompleteResult = parsePostgreSqlQueryWithoutCursor(
        'ALTER TABLE test_table DROP CONSTRAINT test_constraint;',
    );
    expect(autocompleteResult.errors).toHaveLength(0);
});
