import $ from 'jquery';

class Search {
    //1. describing and create/initiate our obj
    constructor() {
        // dot for class and hash for id
        this.addSearchHTML();
        this.resultsDiv = $("#search-overlay__results");
        this.openButton = $(".js-search-trigger");
        this.closeButton = $(".search-overlay__close");
        this.searchOverlay = $(".search-overlay");
        this.searchField = $("#search-term");
        this.events();
        this.isOverlayOpen = false;
        this.isSpinnerVisible = false;
        this.previousValue;
        this.typingTimer;
    }

    //2. events
    events() {
        this.openButton.on("click", this.openOverlay.bind(this));
        this.closeButton.on("click", this.closeOverlay.bind(this)); //not using bind will result in on changing the value. keyup only runs events on lifting key while keydown will keep firing the event until you lift it up
        $(document).on("keydown", this.keyPressDispatcher.bind(this)); //we are saying make whole page be lookout for keypress
        this.searchField.on("keyup", this.typingLogic.bind(this));
    }

    //3. methods (fn,action)
    typingLogic() {
            if (this.searchField.val() != this.previousValue) { //if arrow keys are pressed dont run slider
                clearTimeout(this.typingTimer); //otherwise different instances of timer would have been running
                if (this.searchField.val()) {
                    if (!this.isSpinnerVisible) { //if not empty than only show slider and results
                        this.resultsDiv.html('<div class="spinner-loader"></div>');
                        this.isSpinnerVisible = true;
                    }
                    this.typingTimer = setTimeout(this.getResults.bind(this), 750); //wait x millisecs
                } else {
                    this.resultsDiv.html('');
                    this.isSpinnerVisible = false;
                }

            }

            this.previousValue = this.searchField.val();
        }
        //can't use if statement in js literal so use ternary op
    getResults() {
            $.getJSON(universityData.root_url + '/wp-json/university/v1/search?term=' + this.searchField.val(), (results) => {
                        this.resultsDiv.html(`
        <div class="row">
         <div class="one-third">
            <h2 class="search-overlay__section-title">General Information</h2>
            ${results.generalInfo.length ? '<ul class="link-list min-list">' : '<p>No general information matches that search.</p>'}
              ${results.generalInfo.map(item => `<li><a href="${item.permalink}">${item.title}</a> ${item.postType == 'post' ? `by ${item.authorName}` : ''}</li>`).join('')}
            ${results.generalInfo.length ? '</ul>' : ''}
          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Programs</h2>
			${results.programs.length ? '<ul class="link-list min-list">' :  `<p>No programs matches that search. <a href="${universityData.root_url}/programs">View all programs</a></p>`}
			${results.programs.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join('')}
			${results.programs.length ? '</ul>' : ''}

            <h2 class="search-overlay__section-title">Professors</h2>
            ${results.professors.length ? '<ul class="professor-cards">' : `<p>No professors match that search.</p>`}
              ${results.professors.map(item => `
                <li class="professor-card__list-item">
                  <a class="professor-card" href="${item.permalink}">
                    <img class="professor-card__image" src="${item.image}">
                    <span class="professor-card__name">${item.title}</span>
                  </a>
                </li>
              `).join('')}
          </div>
          <div class="one-third">
            <h2 class="search-overlay__section-title">Campuses</h2>
			${results.campuses.length ? '<ul class="link-list min-list">' : `<p>No campuses matches that search. <a href="${universityData.root_url}/campuses">View all campuses</a></p>`}
			${results.campuses.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join('')}
			${results.campuses.length ? '</ul>' : '' }

            <h2 class="search-overlay__section-title">Events</h2>
            ${results.events.length ? '' : `<p>No events matches that search. <a href="${universityData.root_url}/events">View all events</a></p>`}
            ${results.events.map(item => `
            <div class="event-summary">
	          <a class="event-summary__date t-center" href="${item.permalink}">
            <span class="event-summary__month">${item.month}</span>
		<span class="event-summary__day">${item.day}</span>
	</a>
	<div class="event-summary__content">
		<h5 class="event-summary__title headline headline--tiny"><a href="${item.permalink}">${item.title}</a></h5>
            <p>${item.description}<a href="${item.permalink}" class="nu gray">Learn more</a></p>
	</div>
</div>
            `).join('')}
            </div>
        </div>
      `);
			this.isSpinnerVisible = false;
		});

		//asynchronous
        //delete below code later
		// $.when(
		// 	$.getJSON(universityData.root_url + '/wp-json/wp/v2/posts?search=' + this.searchField.val()),    //in when getJSON doesnt need second argument
		// 	$.getJSON(universityData.root_url + '/wp-json/wp/v2/pages?search=' + this.searchField.val())
		// ).then((posts, pages) => {
		// 	var combinedResults = posts[0].concat(pages[0]);
		// 	this.resultsDiv.html(`
		// 	<h2 class="search-overlay__section-title">General Information</h2>
		// 	${combinedResults.length ? '<ul class="link-list min-list"> ' : '<p>No general information matches that search.</p>' }
		// 	${combinedResults.map(item => `<li><a href="${item.link}">${item.title.rendered}</a> ${item.type == 'post' ? `by ${item.authorName}` : ''} </li>`).join('')}
		// 	${combinedResults.length ? '</ul>' : '' }
		// 	`);  //cant dropdown b/w html so use `
		// 	this.isSpinnerVisible = false;
		// }, () => {
		// 	this.resultsDiv.html('<p>Unexpected error; please try again.</p>');
		// });
		//$ to begin using jquery than . to look inside jquery obj
}

	keyPressDispatcher(e) {
		if (e.keyCode == 83 && !this.isOverlayOpen && !$("input, textarea").is(':focus')) {   //reading from dom(to see if class is active) is slow than using its var.
			this.openOverlay();
		}

		if (e.keyCode == 27 && this.isOverlayOpen) {
			this.closeOverlay();
		}
	}

	openOverlay() {
		this.searchOverlay.addClass("search-overlay--active");
		$("body").addClass("body-no-scroll");
		this.searchField.val('');
		setTimeout( () => this.searchField.focus(), 301)   //focus not working due to overlay being not loaded so use delay
		console.log("open ran");
    this.isOverlayOpen = true;
    return false;
	}

	closeOverlay() {
		this.searchOverlay.removeClass("search-overlay--active");
		$("body").removeClass("body-no-scroll");
		console.log("close ran");
		this.isOverlayOpen = false;
	}

	addSearchHTML() {
		$("body").append(`
			<div class = "search-overlay">
\t<div class = "search-overlay__top">
\t\t<div class = "container">
\t\t\t<i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
\t\t\t<input type="text" class="search-term" placeholder="What are you looking for?" id="search-term">
\t\t\t<i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
\t\t</div>
\t</div>
\t<div class="container">
\t\t<div id="search-overlay__results"></div>
\t</div>
\t\t
  </div>
		`);
	}
}

export default Search;