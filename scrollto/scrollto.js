function offset(target){
	var left = 0,
		top = 0;

	while (target && target !== document.body){
		if (target.offsetLeft){
			left += target.offsetLeft;
			top  += target.offsetTop;
		}
		target = target.offsetParent;
	}
	return {left:left, top:top};
}
function scrollToTarget(target){
	var pos = offset(target);
	window.scrollTo(pos.left, pos.top);
	return pos;
}


/////

function offsetY(target){
	var top = 0;

	while (target && target !== document.body){
		if (target.offsetTop){
			top += target.offsetTop;
		}
		target = target.offsetParent;
	}
	return top;
}

function scrollToY(target){
	var top = offsetY(target);
	window.scrollTo(window.scrollX, top);
	return top;
}