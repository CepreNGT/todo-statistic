const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();
const comments = getComments();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getComments() {
    let comments = [];
    for (const file of files) {
        let index = 0;
        while (index < file.length) {
            let comment_index = index + file.substring(index).indexOf("// TODO ");
            if (comment_index === index - 1) {
                break;
            }
            let n_index = comment_index + file.substring(comment_index).indexOf("\r\n");
            if (n_index === comment_index - 1) {
                n_index = file.length;
            }
            comments.push(file.substring(comment_index, n_index));
            index = n_index;
        }
    }
    return comments;
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            for (const comment of comments) {
                console.log(comment);
            }
            break;
        case 'important':
            for (const comment of comments) {
                if (comment.indexOf("!") !== -1) {
                    console.log(comment);
                }
            }
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
