describe('Dataset', function() {
  var www = WWW(), mockResults, mockResultsDisplayFn;

  mockResults = [
    { value: 'one', raw: { value: 'one' } },
    { value: 'two', raw: { value: 'two' } },
    { value: 'three', raw: { value: 'three' } }
  ];

  mockResultsDisplayFn = [
    { display: '4' },
    { display: '5' },
    { display: '6' }
  ];

  beforeEach(function() {
    this.dataset = new Dataset({
      name: 'test',
      source: this.source = jasmine.createSpy('source')
    }, www);
  });

  it('should throw an error if source is missing', function() {
    expect(noSource).toThrow();

    function noSource() { new Dataset({}, www); }
  });

  it('should throw an error if the name is not a valid class name', function() {
    expect(fn).toThrow();

    function fn() {
      var d = new Dataset({ name: 'a space', source: $.noop }, www);
    }
  });

  describe('#getRoot', function() {
    it('should return the root element', function() {
      var sel = 'div' + www.selectors.dataset + www.selectors.dataset + '-test';
      expect(this.dataset.getRoot()).toBe(sel);
    });
  });

  describe('#update', function() {
    it('should render suggestions', function() {
      this.source.andReturn(mockResults);
      this.dataset.update('woah');

      expect(this.dataset.getRoot()).toContainText('one');
      expect(this.dataset.getRoot()).toContainText('two');
      expect(this.dataset.getRoot()).toContainText('three');
    });

    it('should allow custom display functions', function() {
      this.dataset = new Dataset({
        name: 'test',
        display: function(o) { return o.display; },
        source: this.source = jasmine.createSpy('source')
      }, www);

      this.source.andReturn(mockResultsDisplayFn);
      this.dataset.update('woah');

      expect(this.dataset.getRoot()).toContainText('4');
      expect(this.dataset.getRoot()).toContainText('5');
      expect(this.dataset.getRoot()).toContainText('6');
    });

    /*
    it('should render empty when no suggestions are available', function() {
      this.dataset = new Dataset({
        source: this.source,
        templates: {
          empty: '<h2>empty</h2>'
        }
      }, www);

      this.source.andReturn([]);
      this.dataset.update('woah');

      expect(this.dataset.getRoot()).toContainText('empty');
    });

    it('should render header', function() {
      this.dataset = new Dataset({
        source: this.source,
        templates: {
          header: '<h2>header</h2>'
        }
      }, www);

      this.source.andReturn(mockResults);
      this.dataset.update('woah');

      expect(this.dataset.getRoot()).toContainText('header');
    });

    it('should render footer', function() {
      this.dataset = new Dataset({
        source: this.source,
        templates: {
          footer: function(c) { return '<p>' + c.query + '</p>'; }
        }
      }, www);

      this.source.andReturn(mockResults);
      this.dataset.update('woah');

      expect(this.dataset.getRoot()).toContainText('woah');
    });

    it('should not render header/footer if there is no content', function() {
      this.dataset = new Dataset({
        source: this.source,
        templates: {
          header: '<h2>header</h2>',
          footer: '<h2>footer</h2>'
        }
      }, www);

      this.source.andReturn([]);
      this.dataset.update('woah');

      expect(this.dataset.getRoot()).not.toContainText('header');
      expect(this.dataset.getRoot()).not.toContainText('footer');
    });
    */

    it('should not render stale suggestions', function() {
      this.source.andCallFake(fakeGetWithAsyncResults);
      this.dataset.update('woah');

      this.source.andReturn(mockResults);
      this.dataset.update('nelly');

      waits(100);

      runs(function() {
        expect(this.dataset.getRoot()).toContainText('one');
        expect(this.dataset.getRoot()).toContainText('two');
        expect(this.dataset.getRoot()).toContainText('three');
        expect(this.dataset.getRoot()).not.toContainText('four');
        expect(this.dataset.getRoot()).not.toContainText('five');
      });
    });

    it('should not render async suggestions if update was canceled', function() {
      this.source.andCallFake(fakeGetWithAsyncResults);
      this.dataset.update('woah');
      this.dataset.cancel();

      waits(100);

      runs(function() {
        var rendered = this.dataset.getRoot().find('.tt-result');
        expect(rendered).toHaveLength(3);
      });
    });

    it('should trigger rendered after suggestions are rendered', function() {
      var spy;

      this.dataset.onSync('rendered', spy = jasmine.createSpy());

      this.source.andReturn(mockResults);
      this.dataset.update('woah');

      waitsFor(function() { return spy.callCount; });
    });
  });

  describe('#clear', function() {
    it('should clear suggestions', function() {
      this.source.andReturn(mockResults);
      this.dataset.update('woah');

      this.dataset.clear();
      expect(this.dataset.getRoot()).toBeEmpty();
    });

    it('should cancel pending updates', function() {
      var spy;

      this.source.andReturn(mockResults);
      this.dataset.update('woah');
      spy = spyOn(this.dataset, 'cancel');

      this.dataset.clear();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#isEmpty', function() {
    it('should return true when empty', function() {
      expect(this.dataset.isEmpty()).toBe(true);
    });

    it('should return false when not empty', function() {
      this.source.andReturn(mockResults);
      this.dataset.update('woah');

      expect(this.dataset.isEmpty()).toBe(false);
    });
  });

  describe('#destroy', function() {
    it('should null out the reference to the dataset element', function() {
      this.dataset.destroy();

      expect(this.dataset.$el).toBeNull();
    });
  });

  // helper functions
  // ----------------

  function fakeGetWithAsyncResults(query, cb) {
    setTimeout(function() {
      cb([
        { value: 'four', raw: { value: 'four' } },
        { value: 'five', raw: { value: 'five' } },
      ]);
    }, 0);

    return mockResults;
  }
});