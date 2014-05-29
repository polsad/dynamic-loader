define([

    'backbone'

], function() {

	var DynamicLoader = Backbone.View.extend({

		options: {
		},

		top: 0,
		items: [],
		height: 0,
		images: [],
		loadingFlag: false,

		initialize: function() {
			var self = this;
			self.options.factor = parseInt(self.options.factor) || 1;
			self.options.factor = (self.options.factor < 1) ? 1 : self.options.factor;


			$(self.options.items).each(function() {
				$(this).addClass('dynamic-loader-line');
			});

			$(window).on('resize.dynamic-loader', function() {
				self.top = self.$el.offset().top;
				self.height = $(window).height() * self.options.factor;
                self.calcDynamicLines();
			}).on('scroll.dynamic-loader', function() {
				if (self.loadingFlag == false) {
					self.checkImages();
				}
			}).trigger('resize.dynamic-loader').trigger('scroll.dynamic-loader');
		},

        calcDynamicLines: function() {
            var self = this;

            self.items = [];

            $(self.options.items+'.dynamic-loader-line').each(function() {
                var t = $(this).offset().top;
                var b = t + $(this).outerHeight();
                self.items.push([t, b, $(this).index()]);
            });
        },

		checkImages: function() {
			var self = this;
			self.loadingFlag = true;
			if (self.items.length == 0) {
				// Disable events scroll.dynamic-loader and resize.dynamic-loader
				$(window).off('resize.dynamic-loader').off('scroll.dynamic-loader');
			}

			var top = $(window).scrollTop();
			var bottom = $(window).scrollTop() + self.height;
			var buff = [];

			for (var i = 0; i < self.items.length; i++) {
				if ((self.items[i][0] >= top && self.items[i][0] <= bottom) ||
					(self.items[i][1] >= top && self.items[i][1] <= bottom)) {

					var img = $(self.options.items).eq(self.items[i][2]).find('img');
					for (var j = 0; j < $(img).size(); j++) {
						self.images.push(img[j])
					}
					$(self.options.items).eq(self.items[i][2]).removeClass('dynamic-loader-line');
				}
				else {
					buff.push(self.items[i])
				}
			}
			self.items = buff;

			// Check queue
			if (self.images.length > 0) {
				self.loadImage();
			}
			else {
				self.loadingFlag = false;
			}
		},

		loadImage: function() {
			var self = this;
			if (self.images.length > 0) {
				var img = self.images.shift();

				$(img).on('load', function() {
					$(this).trigger('loaded');
					self.loadImage();
				})
				.on('error', function() {
					$(this).trigger('loaded');
					self.loadImage();
				})
				.attr('src', $(img).attr('data-base-path') + $(img).attr('data-file-name'));
			}
			else {
                self.calcDynamicLines();
				self.checkImages();
			}
		},


		render: function() {
			return this;
		}
	});

	return DynamicLoader;
});