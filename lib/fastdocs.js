// markdown-documentation
"use strict"

function fastdocs() {
	this.fs = require('fs');
	this.markdown = require('marked');
	this.mkpath = require('mkpath');

	this.lexer = [];
	this.tokens = [];

	this.file_number = 0;
	this.current_file = "";
	this.current_level = 1;
	this.header_count = [-1,-1,-1,-1,-1,-1];

	this.TOC = "# Table of Contents \n";

};

fastdocs.prototype.createToc = function(depth, text, filename) {
	var link_id = text.toLowerCase().replace(/[^\w]+/g, '-');
	var link = filename.split('.')[0];

	var mdLink = "";
	for(var i = 0; i < depth; i++)
	{
		mdLink += " ";
	}
	mdLink += "- [" + text +"](./" + link + "/index.html#" + link_id + ") \n";

	fast.TOC += mdLink;
}

// adapt the heads
fastdocs.prototype.headings = function(code) {

	fast.lexer = new fast.markdown.Lexer();
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

			fast.createToc(fast.tokens[i].depth, fast.tokens[i].text, fast.current_file);

			
		}
	}

	return fast.tokens;

}

/**
 * Convert the markdown documents to HTML documents
 * @return {void}
 */
fastdocs.prototype.convert = function() {
	// grab the path
	if(process.argv.length > 2)
	{
		// what is the directory
		fast.directory = process.argv[2];

		//make output director
		fast.mkpath('./output/', function(err) {
			if(err) throw err;
			else {
				console.log('Created the ./output folder');

				// read all the files in the directory
				fast.fs.readdir(fast.directory, function(err, files) {
					if (err) throw err;

					

					// loop through each file
					files.forEach( function (file) {
						fast.file_number++;
						fast.current_file = file;

						var content = fast.fs.readFileSync(fast.directory + "/" + fast.current_file, 'utf8');

						

						//make output director
						var tokens = fast.headings(content);
						fast.mkpath('./output/' + file.split('.')[0] + '/', function(err) {
							if(err) throw err;
							else {
								//create the files
								fast.fs.writeFile('./output/' + file.split('.')[0] + '/index.html', fast.markdown.parser(tokens), function(err) {
									if(err) throw err;
									else console.log('Created ' + file.split('.')[0] + ' page');
								});
							} 
						});
					});	

					// create the table of contents
					fast.lexer = new fast.markdown.Lexer();
					var toctokens = fast.lexer.lex(fast.TOC)
					fast.fs.writeFile('./output/index.html', fast.markdown.parser(toctokens), function(err) {
						if(err) throw err;
						else console.log('Created Table of Contents');
					});
				});
			}
		});

		


		console.log('Done');

	} else {
		console.log('ERROR: No input file set');
	}
};

var fast = new fastdocs();
exports.convert = fast.convert;