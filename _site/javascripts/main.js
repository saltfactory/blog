// console.log('This would be the main JS file.');

var imgs = document.getElementsByTagName('img');

for (var i=0; i< imgs.length; i++){
	var img = imgs[i];
	var alt = img.alt;
	
	var pattern = /({)(.+)(})/g;	
	var match = pattern.exec(alt);
	
	if(match){
		img.setAttribute("style", match[2]);
	}
}