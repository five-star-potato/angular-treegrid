exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['treegrid-spec.js'],
    baseUrl: 'http://localhost:3000',
    useAllAngular2AppRoots: true
};