$(document).ready(function(){
  collapse();
  customScrollRightSidebar();
  spyScroll();
  tabs();
  highlight();
});

$(window).on('load', function(){
  scrollNavigation();
  fadeInPageContent();
});


// HIGHLIGHT CODE AND PRE

function highlight(){
  $('pre code').each(function(i, block){
    hljs.highlightBlock(block);    
  });
}



// COLLAPSE

function collapse(){
  var ele = $('.js-collapse'),
    link = ele.find('.collapse__nav a'),
    content = ele.find('.collapse__content');

  link.on('click', function(){
    var self = $(this);
    $('.js-collapse').removeClass('active');
    self.parents('.js-collapse').addClass('active');
  });
}


// SHOW PAGE CONTENT

function fadeInPageContent(){
  var ele = $('.page-content');
  ele.addClass('active');
}


// SCROLL NAVIGATION

function scrollNavigation () {
  var page_scroll = $('.js-page-scroll');

  getHash(page_scroll);

  $(window).bind('hashchange', function(e) {
    getHash(page_scroll);
  });

  $(window).trigger('hashchange');
}


// GET HASH AND RUN FUNCTIONS

function getHash(page_scroll){

  var anchor_id = document.location.hash.substr(1); //strip #
  if(anchor_id !== ''){
    var element = $('#' + anchor_id);

    if (element.length) {
      navigationActive(element);
      page_scroll.scrollTo(element);
    }
  }
}


// SIDEBAR NAV ACTIVE

function navigationActive(element){
  var nav = $('.js-scroll-navigation');

  nav.removeClass('active');
  if($("#" + element.attr("id").length)){
    $('[href$="#' + element.attr("id") + '"]').addClass('active');
    $('[href$="#' + element.attr("id") + '"]').parent('.js-collapse').addClass('active');
  }
}


// TABS

function tabs(){
  $('[data-toggle="tab"]').on('click', function(e){
    e.preventDefault();

    var self = $(this);
    var siblings = self.parent('.js-toggle-tab').children('[data-toggle="tab"]');

    if(!self.hasClass('active')) {
      var id = self.attr('href');
      siblings.removeClass('active');
      self.addClass('active');

      var target = $(id);
      var siblings_content = target.parent('.js-toggle-tab-content').children('.tab-pane');
      siblings_content.removeClass('active');
      target.addClass('active');
    }

  });
}


// SCROLL PLUGIN

jQuery.fn.scrollTo = function(elem) {
  $(this).scrollTop($(this).scrollTop() - $(this).offset().top + elem.offset().top + 1);
  return this;
};


// SCROLL SPY

function spyScroll(){
  var lastId,
    wrapperScroll = $('.js-page-scroll'),
    topMenuHeight = $('.page-header').outerHeight(),
    menuItems = $('.js-scroll-navigation'),

    scrollItems = menuItems.map(function(){
      var item = $($(this).attr("href"));
      if (item.length) { return item; }
    });

  wrapperScroll.scroll(function(){

    var fromTop = $(this).scrollTop() + topMenuHeight;
    var cur = scrollItems.map(function(){
      if ($(this).offset().top <= topMenuHeight)
       return this;
    });

    cur = cur[cur.length-1];
    var id = cur && cur.length ? cur[0].id : "";

    if (lastId !== id) {
      lastId = id;

      menuItems.removeClass("active");
      $("[href='#" + id + "']").addClass('active');

      // location.hash = '#' + lastId;

      $('.js-collapse').removeClass('active');
      $("[href='#" + id + "']").parents('.js-collapse').addClass('active');
     }
  });
}


// SCROLLING RIGHT SIDEBAR

function customScrollRightSidebar(){
  var ele = $('.js-page-sidebar');
  ele.slimScroll({
      height: '100%',
      railOpacity: .2,
      color: '#333c4e'
  });
}
