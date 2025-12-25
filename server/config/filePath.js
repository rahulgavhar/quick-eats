import path from 'path';

const __dirname = path.resolve();

export const FILE_PATHS = {
    UPLOADS_DIR: path.join(__dirname, 'public', 'uploads'),
    TEMP_DIR: path.join(__dirname, 'temp'),
};