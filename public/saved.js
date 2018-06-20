

// Grab the articles as a json and then display it on the page
function renderArticles() {
    $.getJSON("/articles", function (data) {
        // goes through article db, an renders only article that have been marek as saved
        for (var i = 0; i < data.length; i++) {
            if (data[i].artsave === true) {
                //creating card for each article entry
                var newCard = `<div class="card">
                <a href="${data[i].link}"><h5 class="card-header">${data[i].title}</h5></a>
                <div class="card-body">
                <p class="card-text">${data[i].summary}</p>
                <a  href="#"  data-id="${ data[i]._id}" class="btn btn-primary deleteArticle">Delete</a>
                <a  href="#"  data-id="${ data[i]._id}" class="btn btn-primary addNotes">Add Notes</a>
                </div>
                 </div>`
                $("#articles").append(newCard);
            }
        }
    });
}

renderArticles();


// this function renders notes that are associated with an article
function renderNotes(articleId) {
    // Empty the notes from the note section
    $("#notes").empty();
    $("#notes").show()
    $.ajax({
        method: "GET",
        url: "/articles/" + articleId
    })
        // adding note info to page
        .then(function (data) {

            $("#notes").append("<div class='card' style='width: 18rem;'  id='displayNotes'></div>");
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            $("#notes").append("<button data-id='" + articleId + "' id='savenote'>Save Note</button>");

            for (var i = 0; i < data.length; i++) {
                // If there's a note in the article this prevent empty note inputs that are submitted by user
                if (data[i].body) {
                    // Place the body of the note in the body textarea
                    $("#displayNotes").append(`<span class="noteX">
                     <button data-id='${data[i]._id}' data-articleid ="${articleId}"  class="deleteBtn btn btn-dark">X</button>${data[i].body}</span>`);
                }
            }

        });
}



// Whenever someone clicks add note for an article 
$(document).on("click", ".addNotes", function () {
    // Saving the id of the article
    var articleId = $(this).attr("data-id");
    renderNotes(articleId)

});

// deletes a particular note when the delete button is clicked
$(document).on("click", ".deleteBtn", function () {
    var noteId = $(this).data("id")
    var articleId = $(this).data("articleid")
    $.ajax({
        method: "DELETE",
        url: "/deletethisnote/" + noteId
    })
        // With that done
        .then(function (data) {
            renderNotes(articleId)
        });
})


// deletes article and notes that are associated with it
$(document).on("click", ".deleteArticle", function () {
    var id = $(this).data("id")
    $.ajax({
        method: "DELETE",
        url: "/deletethisarticle/" + id
    })
        // With that done
        .then(function (data) {
            $("#articles").empty();
            renderArticles();
        });
})


// When the save note button gets clicked
$(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var articleId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + articleId,
        data: {
            //getting data from text field
            body: $("#bodyinput").val()
        }
    })
        .then(function (data) {
            $("#notes").empty();
        });

    // removing the values entered in the input and textarea for note entry
    $("#bodyinput").val("");
    $("#notes").hide()


});
