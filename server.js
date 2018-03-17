console.log('server is starting');
const express = require('express');
const path = require('path');
const app = express();
const dname = __dirname;
app.use(express.static('public'));

app.get('/', (req, res) => {
    console.log('Getting Home Page');
    res.sendFile(dname + '/EzWork2.html');
    // res.sendFile(path.join(__dirname + '/public/EzWork2.html'));
});

app.get('/signup', (req, res) => {
    console.log('Getting Signup Page');
    res.sendFile(dname + '/create_account.html');
});

app.get('/finder_profile', (req, res) => {
    console.log('Getting Finder Profile');
    res.sendFile(dname + '/finder_prof.html');
});

app.get('/finder_jobs', (req, res) => {
    console.log('Getting Finder Jobs');
    res.sendFile(dname + '/finder_jobs.html');
});

app.get('/employer_profile', (req, res) => {
    console.log('Getting Employer Profile');
    res.sendFile(dname + '/employer_prof.html');
});

app.get('/employer_jobs', (req, res) => {
    console.log('Getting Employer Jobs');
    res.sendFile(dname + '/employer_jobs.html');
});

app.get('/JobPostCreation', (req, res) => {
    console.log('Getting JobPostCreation');
    res.sendFile(dname + '/JobPostCreation.html');
});

const server = app.listen(8080, () => {
    console.log('listening...');
});
