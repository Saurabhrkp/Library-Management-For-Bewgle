$(document).ready(function () {
  $('#profileForm :input').prop('disabled', true);
  $('#editProfile').prop('disabled', false);
  $('#deletebutton').prop('disabled', false);
  $('#submitProfile').hide();
  $('#editProfile').click(function () {
    if (this.value == 'Edit Profile') {
      this.value = 'Cancel';
      $('#profileForm :input').prop('disabled', false);
      $('#editProfile').prop('disabled', false);
      $('#deletebutton').prop('disabled', false);
      $('#submitProfile').show();
    } else {
      this.value = 'Edit Profile';
      $('#profileForm :input').prop('disabled', true);
      $('#editProfile').prop('disabled', false);
      $('#deletebutton').prop('disabled', false);
      $('#submitProfile').hide();
    }
  });
});

$('#coverImage').change(function (e) {
  if (e.target.files.length) {
    if (typeof FileReader != 'undefined') {
      let coverImagePreview = $('#coverImagePreview');
      coverImagePreview.html('');
      $(this).next('.custom-file-label').html(e.target.files[0].name);
      let reader = new FileReader();
      let file = e.target.files[0];
      reader.onload = function (e) {
        let col = $("<div class='col-sm-5 col-md-4 col-lg-3 mb-3'></div>");
        let img = $("<img class='d-block w-100'/>");
        img.attr('src', e.target.result);
        col.append(img);
        coverImagePreview.append(col);
      };
      reader.readAsDataURL(file);
    } else {
      alert('This browser does not support HTML5 FileReader.');
    }
  } else {
    $(this).next('.custom-file-label').html('Choose Cover Image');
  }
});
