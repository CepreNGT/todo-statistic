const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();
const comments = getComments();
getSortedComments('user')

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getComments() {
    const comments = [];
    for (const file of files) {
        let index = 0;
        while (index < file.length) {
            const comment_index = index + file.substring(index).indexOf('// TODO ');
            if (comment_index === index - 1) {
                break;
            }
            let n_index = comment_index + file.substring(comment_index).indexOf('\r\n');
            if (n_index === comment_index - 1) {
                n_index = file.length;
            }
            comments.push(file.substring(comment_index, n_index));
            index = n_index;
        }
    }
    return comments;
}

function printTable(comments) {
    const formatCell = (value, width, isTruncate = false) => {
        if (isTruncate && value.length > width - 3) {
            return value.slice(0, width - 3) + "...";
        }
        return value.padEnd(width);
    };

    for (const comment of comments) {
        const parts = comment.split(";");
        const user = parts[0].slice(8).trim();
        const date = parts[1]?.trim() || "";
        const text = parts[2]?.trim() || "";
        const importance = text.includes("!") ? "!" : " ";

        const importanceCell = formatCell(importance, 1);
        const userCell = formatCell(user, 10, true);
        const dateCell = formatCell(date, 10, true);
        const textCell = formatCell(text, 50, true);

        console.log(
            `  ${importanceCell}  |  ${userCell}  |  ${dateCell}  |  ${textCell}`
        );
    }
}

function parseCommentsToObject() {
    const commentsObject = {};
    commentsObject[0] = [];
    for (const comment of comments) {
        if (comment.split(';').length !== 3) {
            commentsObject[0].push(comment);
        } else {
            username = comment.split(';')[0].substring(8).toLowerCase();
            if (!commentsObject[username]) {
                commentsObject[username] = [];
            }
            commentsObject[username].push(comment);
        }
    }
    return commentsObject;
}

function count(str, symbol) {
    let count = 0;
    for (let char of str) {
        if (char === symbol) {
            count++;
        }
    }
    return count;
};

function comparer(a, b) {
    if (a.split(';').length !== 3) {
        return false;
    }
    if (b.split(';').length !== 3) {
        return true;
    }
    const dateA = new Date(a.split(';')[1].trim());
    const dateB = new Date(b.split(';')[1].trim());
    return dateB - dateA;
}

function getSortedComments(arg) {
    switch (arg) {
        case 'importance':
            return comments.concat().sort((a, b) => count(b, '!') - count(a, '!'));
        case 'user':
            const result = [];
            const commentsObject = parseCommentsToObject();
            for (const key of Object.keys(commentsObject)) {
                if (key === '0') {
                    continue;
                }
                for (const comm of commentsObject[key]) {
                    result.push(comm);
                }
            }
            for (const comm of commentsObject[0]) {
                result.push(comm);
            }
            return result;
        case 'date':
            return comments.concat().sort(comparer);
    }
}

function processCommand(command) {
    const parsedCommand = command.split(' ');
    switch (parsedCommand[0]) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            printTable(comments);
            break;
        case 'important':
            printTable(comments.filter(comment => comment.includes("!")));
            break;
        case 'sort':
            const sortedComments = getSortedComments(parsedCommand[1]);
            printTable(sortedComments);
            break;
        case 'user':
            let name = parsedCommand[1].toLowerCase();
            printTable(
                comments.filter(comment =>
                    comment.split(";")[0].slice(8).toLowerCase() === name
                )
            );
            break;
        case 'date':
            const dateStr = parsedCommand[1];
            let minDate;
            const dateParts = dateStr.split('-').map(Number);
            if (dateParts.length === 1) {
                minDate = new Date(dateParts[0], 0, 1);
            } else if (dateParts.length === 2) {
                minDate = new Date(dateParts[0], dateParts[1] - 1, 1);
            } else if (dateParts.length === 3) {
                minDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            }

            printTable(
                comments.filter(comment => {
                    const match = comment.match(/;\s*(\d{4}-\d{2}-\d{2})\s*;/);
                    if (match) {
                        const commentDate = new Date(match[1]);
                        return commentDate >= minDate;
                    }
                    return false;
                })
            );
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
