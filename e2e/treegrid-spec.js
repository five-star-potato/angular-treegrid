describe('angular 2 treegrid', function() {
  it('should display a treegrid', function() {
    browser.get('http://localhost:3000/home');

    expect(element.all(by.css('.treegrid-table > thead > tr > th')).first().getText()).toMatch(/Emplyee/);
    /*
    element.all(by.css('.treegrid-table > thead > tr > th')).then(function (elements) {
        elements[0].getWebElement().then(function(item) {
            console.log(item);
        });
        expect(elements[0].isPresent()).toBe(true);
    });
    */
  });
});