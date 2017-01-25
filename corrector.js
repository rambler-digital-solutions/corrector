const form        = document.querySelector('.js-mistake');
const formClose   = form.querySelectorAll('.js-mistake-close');
const formButton  = form.querySelector('.js-mistake-button');
const formMessage = form.querySelector('.js-mistake-message');

const keyMap      = { 13: false, 17: false };

/**
 * [replace extra spaces and linebreaks from string]
 * @param  {[String]} line [input value]
 * @return {[String]}      [output value]
 */
const removeExtra = line => line.replace(/(\r\n|\n|\r)/gm, ` `).replace(/\s+/g, ` `);

/**
 * [prepare parameters for building mistake fragment]
 * @param  {[Object]} res [input value]
 * @return {[Object]}     [output value]
 */
const modifyTexts = res => {
  let i = 0;
  while (res.preCaret[0] !== res.text[0]
  ||     res.preCaret[res.preCaret.length - 1] !== res.text[res.preCaret.length - 1]) {
    let withoutSpace;
    let withSpace;
    if (!res.preCaret[i] || !res.text[i]) break;
    if ( res.preCaret[i] === res.text[i]) { i++; continue; }

    withoutSpace = res.preCaret.slice(0, i) + res.preCaret.slice(i + 1);
    if (res.preCaret[i] === ` ` && withoutSpace[i] === res.text[i]) {
      res.preCaret = withoutSpace;
      i++;
      continue;
    }

    withSpace = res.preCaret.slice(0, i) + ` ` + res.preCaret.slice(i + Math.abs(0));
    if (res.text[i] === ` ` && withSpace[i] === res.text[i]) {
      res.preCaret = withSpace;
      i++;
      continue;
    }

    i++;
  }

  if (res.selected[res.selected.length - 1] !== res.preCaret[res.preCaret.length - 1]
  &&  res.selected[res.selected.length - 1] === ` `) {
    res.selected = res.selected.slice(0, res.selected.length - 1);
  }

  return res;
}

/**
 * [main function that find ]
 * @param  {[Object]} sel [actual data about selection area]
 * @return {[Object]}     [prepared data to build mistake fragment]
 */
const getSelectionData = sel => {
  let result = { text: ``, 'preCaret': ``, selected: `` };
  let node = null;
  if (window.getSelection
  &&  sel.rangeCount) {
    let range         = window.getSelection().getRangeAt(0);
    let preCaretRange = range.cloneRange();

    node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType != 1) node = node.parentNode;

    preCaretRange.selectNodeContents(node);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    result.preCaret = removeExtra(preCaretRange.toString());

  } else if (sel === document.selection
    &&       sel.type !== `Control`) {
    let textRange         = sel.createRange();
    let preCaretTextRange = document.body.createTextRange();

    node = sel.createRange().parentElement();

    preCaretTextRange.moveToElementText(node);
    preCaretTextRange.setEndPoint(`EndToEnd`, textRange);
    result.preCaret = removeExtra(preCaretTextRange.text);
  }
  result.text = removeExtra(node.innerText);
  result.selected = removeExtra(sel.toString());

  result = modifyTexts(result);

  return result;
};

/**
 * [a function that is called when the user selected text]
 * @return {[String]} [html string that is prepared to be appended to DOM]
 */
const catchFragment = () => {
  let sel            = window.getSelection ? window.getSelection() : document.selection;
  let data           = getSelectionData(sel);
  let fragmentRange  = 80;
  let beforeIndex    = data.preCaret.length - data.selected.length - fragmentRange;
  let beforeFragment = ``;
  let fragment       = `<span>${data.selected}</span>`;

  if (data.selected.length === 0) return;

  for (let i = data.preCaret.length; i < data.preCaret.length + fragmentRange; i++) {
    if (!data.text[i]) break;
    fragment += data.text[i];
  }

  fragment += `...`;

  for (let i = beforeIndex; i < data.preCaret.length - data.selected.length; i++) {
    if (data.text[i]) beforeFragment += data.text[i];
  }

  fragment = `...${beforeFragment + fragment}`;

  return fragment;
};



// _____ CUSTOM LOGIC _____

const openForm = () => {
  let fragment = catchFragment();
  formMessage.innerHTML = fragment;
  window.bodyFixed(true);
  form.classList.add('is-active');
};

const closeForm = () => {
  window.bodyFixed(false);
  form.classList.remove('is-active');
}

const submitForm = () => {};

const setEvents = () => {
  document.addEventListener('keydown', e => {
    if (e.keyCode in keyMap) {
      keyMap[e.keyCode] = true;
      keyMap[13] && keyMap[17] && !form.classList.contains('is-active') && openForm();
    }
  });

  document.addEventListener('keyup', e => {
    if (e.keyCode in keyMap) keyMap[e.keyCode] = false;
  });

  for (let i = 0; i < formClose.length; i++) formClose[i].addEventListener('click', closeForm);

  formButton.addEventListener('click', submitForm);
};

form && setEvents();
