$( document ).ready(function() {
  $('input[type="checkbox"].check-all').change(checkChildren);
  $('input[type="checkbox"].check-all').each(function() {
    var selector = $(this).data('selector'),
        childrenQuery = 'input[data-selector-item="' + selector + '"]';
    $(childrenQuery).change(checkParent);
  });
});

function checkChildren(e) {
  var checked = $(this).prop("checked"),
      selector = $(this).data('selector');
      childrenQuery = 'input[data-selector-item="' + selector + '"]',
      children = $(childrenQuery),
      buttonQuery = 'input[data-selector-button="' + selector + '"]',
      button = $(buttonQuery);

  children.prop({
    checked: checked
  });

  button.prop('disabled', !checked);
};

function checkParent(e) {
  var checked = $(this).prop('checked'),
      selector = $(this).data('selector-item'),
      parentQuery = 'input[data-selector="' + selector + '"]',
      siblingQuery = 'input[data-selector-item="' + selector + '"]',
      buttonQuery = 'input[data-selector-button="' + selector + '"]',
      parent = $(parentQuery),
      siblings = $(siblingQuery),
      button = $(buttonQuery),
      all = true;

  siblings.each(function() {
    return all = all && ($(this).prop('checked') === checked);
  });

  parent.prop({
    indeterminate: !all,
    checked: all && checked
  });

  button.prop('disabled', (all && !checked));
};