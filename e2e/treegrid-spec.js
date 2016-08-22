describe('angular 2 treegrid', function() {
  it('should display a treegrid', function() {
    browser.get('http://localhost:3000/home');

    var tg = element(by.tagName('tg-treegrid'));
    expect(tg.isPresent()).toBe(true);
  });
});