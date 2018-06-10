

// Grab the articles as a json
function renderArticles() {
    $.getJSON("/articles", function (data) {
        console.log(data)
        for (var i = 0; i < data.length; i++) {
            if (data[i].artsave === true) {

                var newCard = `<div class="card">
                <h5 class="card-header">${data[i].title}</h5>
                <div class="card-body">
                <p class="card-text">${data[i].summary}</p>
                <a  href="#"  data-id="${ data[i]._id}" class="btn btn-primary deleteArticle">Delete</a>
                <a  href="#"  data-id="${ data[i]._id}" class="btn btn-primary addNotes">Add Notes</a>
                </div>
                 </div>`

                // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
                $("#articles").append(newCard);
            }
        }
    });
}

renderArticles();



// Whenever someone clicks add note 
$(document).on("click", ".addNotes", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    $("#notes").show()
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            // The title of the article
            $("#notes").append("<h4>" + data.title + "</h4>");
            // An input to enter a new title
            $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
            }
        });
});

$(document).on("click", ".deleteArticle", function () {

    var id = $(this).data("id")
    $.ajax({
        method: "POST",
        url: "/deletethisarticle/" + id
    })
        // With that done
        .then(function (data) {
            $("#articles").empty();
            renderArticles();
        });


})
// When you click the savenote button
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
    $("#notes").hide()


});
