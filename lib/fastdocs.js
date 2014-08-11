// markdown-documentation
"use strict"

function fastdocs() {
	this.fs = require('fs');
	this.markdown = require('marked');

	this.lexer = new this.markdown.Lexer();
	this.tokens = [];

	this.file_number = 0;
	this.current_file = "";
	this.current_level = 1;
	this.header_count = [-1,-1,-1,-1,-1,-1];

};

// adapt the heads
fastdocs.prototype.headings = function(code) {

	fast.tokens = fast.lexer.lex(code);

	// loop through the headers
	for(var i = 0; i < fast.tokens.length; i++)
	{
		if(fast.tokens[i].type == "heading")
		{
			// if we have gone down a level we need to add a point
			if(fast.current_level == fast.tokens[i].depth)
			{
				fast.header_count[fast.current_level-2]++;
			} else if(fast.current_level < fast.tokens[i].depth)
			{
				fast.current_level++;
				fast.header_count[fast.current_level-2] = 0;
				fast.header_count[fast.current_level-2]++;
			} else if(fast.current_level > fast.tokens[i].depth)
			{
				fast.header_count[fast.current_level-2] = -1;
				fast.current_level--;
				fast.header_count[fast.current_level-2] ++;
			}

			// now we need to construct the header level
			var header_level = fast.file_number;
			// append the subheadings
			for(var h = 0; h < fast.header_count.length; h++)
			{
				if(fast.header_count[h] != -1)
				{
					header_level += '.' + fast.header_count[h];
				} else if((h == 0) && (fast.header_count[h] == -1)) {
					header_level += '.0';
				}
			}

			fast.tokens[i].text = header_level + ' ' + fast.tokens[i].text;
		}
	}

}

/**
 * Convert the markdown documents to HTML documents
 * @return {void}
 */
fastdocs.prototype.convert = function() {
	// grab the path
	if(process.argv.length > 2)
	{
		this.current_file = process.argv[2];

		if(fast.fs.existsSync(this.current_file))
		{
			fast.file_number = 2;

			var code = fast.fs.readFileSync(this.current_file, 'utf8');

			fast.convertedFile = fast.parseMarkdown(code);
			fast.headings(code);

			console.log(fast.markdown.parser(fast.tokens));

			//fs.writeFileSync(file, this.convertedFile);

			console.log('Done');

		} else {
			console.log('ERROR: The input file does not exist');
		}

	} else {
		console.log('ERROR: No input file set');
	}
};

/**
 * Parse the markdown and spit out the HTML
 * @return {String} HTML
 */
fastdocs.prototype.parseMarkdown = function(code) {
	fast.markdown.setOptions({
		highlight: function (code) {
			return require('hightlight.js').hightlightAuto(code).value;
		}
	});

	return fast.markdown(code)	
}

var fast = new fastdocs();
exports.convert = fast.convert;