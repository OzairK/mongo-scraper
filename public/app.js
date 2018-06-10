

// Grab the articles as a json
function renderArticles() {
  $.getJSON("/articles", function (data) {
    console.log(data)
    for (var i = (data.length-1); i > (data.length-20); i--) {

      var newCard = `<div class="card">
      <a href="${data[i].link}"><h5 class="card-header">${data[i].title}</h5></a>
      <div class="card-body">
      <p class="card-text">${data[i].summary}</p>
      <a  href="#"  data-id="${ data[i]._id}" class="btn btn-primary saveArticle">Save Article</a>
      </div>
      </div>`

      // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
      $("#articles").append(newCard);
    }
  });
}

renderArticles();

$(document).on("click", ".saveArticle", function () {

  // console.log("something has been clicked" + $(this).data("id") )
 var id = $(this).data("id")
  $.post( "savethisarticle/"+ id, function( data ) {
    $("#articles").empty();
    renderArticles()
  });
})


$(document).on("click", "#scrapeNow", function () {
  $.ajax({
    method: "GET",
    url: "/scrape",
  })
    .then(function (data) {
      $("#articles").empty();
      renderArticles();
    })
})


