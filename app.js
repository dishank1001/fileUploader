const express = require('express');
const path = require('path');
const busboy = require('connect-busboy');
const fs = require('fs-extra');

const app = express();

app.use(busboy({
    highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
}));

const uploadPath = path.join(__dirname, 'fu/'); // Register the upload path
fs.ensureDir(uploadPath);

app.route('/upload').post((req,res,next) => {
    req.pipe(req.busboy);

    req.busboy.on('file', (fieldname, file, filename) => {
        console.log(`Upload of '${filename}' started`);

        const fstream = fs.createWriteStream(path.join(uploadPath, filename));

        file.pipe(fstream);

        fstream.on('close', ()=> {
            console.log(`Upload of '${filename}' finished`);
            res.redirect('back');
        });
    });
});

app.route('/').get((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="upload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="fileToUpload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});

app.listen(3000, () => console.log("Server running on port 3000"));