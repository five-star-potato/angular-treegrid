describe('angular 2 treegrid', function() {
  it('should display a treegrid', function() {
    browser.get('http://localhost:3000/demo1');

    expect(element.all(by.css('.treegrid-table > thead > tr > th')).first().getText()).toMatch(/Employee/);

    expect(element.all(by.css('.treegrid-table > thead > tr > th')).get(1).getText()).toMatch(/Given/);

    // Click the Given name column to sort it in desc order
    element.all(by.css('.treegrid-table > thead > tr > th')).get(1).click();
    // The first row should point to ID 94
    expect(element.all(by.css('.treegrid-table > tbody > tr')).first().all(by.tagName('td')).get(0).getText()).toMatch(/94/);
    // The last row should point to 1 (or Tommen)
    expect(element.all(by.css('.treegrid-table > tbody > tr')).last().all(by.tagName('td')).get(1).getText()).toMatch(/TOMMEN/);
      /*
    element.all(by.css('.treegrid-table > thead > tr > th')).then(function (elements) {
        elements[0].getWebElement().then(function(item) {
            console.log(item);
        });
        expect(elements[0].isPresent()).toBe(true);
    });
    */
    //browser.pause();
  });
});