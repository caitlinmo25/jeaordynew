// categories is the main data structure for the app; it looks like this:
//
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  const response = await axios.get('https://rithm-jeopardy.herokuapp.com/api/categories', {
    params: {
      count: 100 // Change this value if you want a different number of categories
    }
  });
  const categoryIds = _.sampleSize(response.data.map(category => category.id), 6); // Change the number to match the count above
  return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const response = await axios.get('https://rithm-jeopardy.herokuapp.com/api/category', {
    params: {
      id: catId
    }
  });
  const clues = response.data.clues.map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null
  }));
  const title = response.data.title;
  return { title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
function fillTable() {
  const $thead = $('#jeopardy thead');
  const $tbody = $('#jeopardy tbody');

  // Clear the table
  $thead.empty();
  $tbody.empty();

  // Add category headers to the table
  const $headerRow = $('<tr>');
  for (const category of categories) {
    const $headerCell = $('<td>').text(category.title);
    $headerRow.append($headerCell);
  }
  $thead.append($headerRow);

  // Add clue cells to the table
  for (let i = 0; i < 5; i++) {
    const $row = $('<tr>');
    for (let j = 0; j < 6; j++) {
      const clue = categories[j].clues[i];
      const $cell = $('<td>').addClass('clue').attr('data-question', clue.question).text('?');
      $row.append($cell);
    }
    $tbody.append($row);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 */
function handleClick(evt) {
  const $cell = $(evt.target);
  const question = $cell.data('question');
  const clue = categories.find(category => category.clues.some(clue => clue.question === question)).clues.find(clue => clue.question === question);

  if (clue.showing === null) {
    $cell.text(clue.question);
    clue.showing = 'question';
  } else if (clue.showing === 'question') {
    $cell.text(clue.answer);
    clue.showing = 'answer';
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  const $table = $('#jeopardy');
  const $spinContainer = $('#spin-container');
  const $startButton = $('#start');

  $table.hide();
  $spinContainer.show();
  $startButton.prop('disabled', true);
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  const $table = $('#jeopardy');
  const $spinContainer = $('#spin-container');
  const $startButton = $('#start');

  $spinContainer.hide();
  $table.show();
  $startButton.text('Restart').prop('disabled', false);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 */
async function setupAndStart() {
  showLoadingView();

  const categoryIds = await getCategoryIds();
  categories = await Promise.all(categoryIds.map(getCategory));
  fillTable();

  hideLoadingView();
}

/** On click of start / restart button, set up game. */
$('#start').on('click', setupAndStart);

/** On page load, add event handler for clicking clues */
$(document).on('click', '.clue', handleClick);
