import {CharStreams, CommonTokenStream, Lexer as LexerType, Parser as ParserType} from 'antlr4ng';

import {CursorPosition, LexerConstructor, ParserConstructor} from '../autocomplete-types';
import {getCursorIndex} from './cursor';

export function getCurrentStatement(
    query: string,
    cursorIndex: number,
): {statement: string; cursorIndex: number} {
    const textBeforeCursor = query.slice(0, cursorIndex - 1);
    const textAfterCursor = query.slice(cursorIndex - 1);

    const semiColonBeforeIndex = textBeforeCursor.lastIndexOf(';');
    const semiColonAfterIndex = textAfterCursor.indexOf(';');

    const statementStartIndex = semiColonBeforeIndex > -1 ? semiColonBeforeIndex + 1 : 0;
    const statementEndIndex =
        semiColonAfterIndex > -1 ? semiColonAfterIndex + textBeforeCursor.length : query.length;

    const statement = query.slice(statementStartIndex, statementEndIndex);
    const newCursorIndex = cursorIndex - statementStartIndex;

    return {statement, cursorIndex: newCursorIndex};
}

const spaceSymbols = '(\\s|\r\n|\n|\r)+';
const explainRegex = new RegExp(`^(${spaceSymbols})?explain${spaceSymbols}$`);
const multipleKeywordsRegex = new RegExp(`^(${spaceSymbols})?\\S+${spaceSymbols}`);

// TODO Find a better way to suggestTemplates
export function shouldSuggestTemplates(query: string, cursor: CursorPosition): boolean {
    const cursorIndex = getCursorIndex(query, cursor);
    const currentStatement = getCurrentStatement(query, cursorIndex);
    const currentStatementBeforeCursor = currentStatement.statement
        .slice(0, currentStatement.cursorIndex)
        .toLowerCase();

    return Boolean(
        cursorIndex === 0 ||
            // First keyword in statement
            !currentStatementBeforeCursor.match(multipleKeywordsRegex) ||
            // Explain statement
            currentStatementBeforeCursor.match(explainRegex),
    );
}

export function getParserFromQuery<L extends LexerType, P extends ParserType>(
    Lexer: LexerConstructor<L>,
    Parser: ParserConstructor<P>,
    query: string,
): P {
    const inputStream = CharStreams.fromString(query);
    const lexer = new Lexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new Parser(tokenStream);

    parser.removeErrorListeners();

    return parser;
}
