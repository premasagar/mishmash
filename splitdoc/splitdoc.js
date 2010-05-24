'use strict';

/*!
* splitdoc
*   github.com/premasagar/mishmash/tree/master/splitdoc/
*
*//*
    split an HTML doc into component sections
        e.g. doctype, head, body, body content, scripts, styles, images, media, links
        with a simple JavaScript jQuery api

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    creates method
        splitdoc
        
    examples
        // blank HTML document boilerplate, as an object
        splitdoc();
        // this returns {doctype:"<!doctype html>",htmlAttr:"",headAttr:"",headContents:"<meta charset=utf-8><title></title>",charset:"utf-8",title:"",bodyAttr:"",bodyContents:""}
        
        // return a blank HTML document boilerplate, as a string
        splitdoc() + '';
        splitdoc().toString(); // this is identical to the line above
        // this returns '<!doctype html><html><head><meta charset=utf-8><title></title></head><body></body></html>'
        
        // Examples of HTML fragments that are converted to full HTML documents
        splitdoc('hello world');
        splitdoc('<p>blah</p>');
        splitdoc('<body><p>blah</p></body>');
        splitdoc('<head><body><p>blah</p></body></head>');
        splitdoc('<head><title>foo</title><body><p>blah</p></body></head>');
        splitdoc('<head><meta charset=utf-8><title>foo</title><body><p>blah</p></body></head>');
        splitdoc('<!doctype html><head><meta charset=utf-8><title>foo</title><body><p>blah</p></body></head>');
        
    notes
        The script attempts absolutely no valdation. It simply works with what it would expect from a valid document or fragment.
        
    TODO
        handle IE conditional tags and the blocks they enclose

*//*
    jslint browser: true, devel: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true
*/

var splitdoc = (function(){
    var exports = exports || {};
    
    function trim(str){
        return str.replace(/^[\0\t\n\v\f\r\s]+|[\0\t\n\v\f\r\s]+$/g, ''); // match the full set of whitespace characters
    }
    
    function Splitdoc(raw, defaults){
        var
            // cast raw to string
            html = typeof raw !== 'undefined' && raw !== null ? raw + '' : '',
        
            // default html document
            // use `defaults` argument to set these
            doctypeDefault = defaults && typeof defaults.doctype !== 'undefined' ? defaults.doctype : '<!doctype html>',
            charsetDefault = defaults && typeof defaults.charset !== 'undefined' ? defaults.charset : 'utf-8',
            charsetMetaDefault = defaults && typeof defaults.charsetmeta !== 'undefined' ? defaults.charsetmeta : '<meta charset=' + charsetDefault + '>',
            titleDefault = defaults && typeof defaults.title !== 'undefined' ? defaults.title : '',
            
            // regular expressions to match supplied document
            doctypeRegex = /<!doctype html[^>]*>/i,
            htmlAttrRegex = /<html([^>]*)>/i,
            headRegex = /<head([^>]*)>(.*?)<\/head>/i, // <head> and the first available </head>, with backrefs: 1) head attributes 2) contents
            // TODO: Improve robustness of the charset regex
            charsetRegex = /<meta charset=([\w\-]+)\s*\/?>|<meta http-equiv=["']Content-Type["'] content=["']text\/html;\s*charset=([\w\-]+)["']\s*\/?>/,
            titleRegex = /<title([^>]*)>(.*?)<\/title>/i,
            bodyRegex = /<body([^>]*)>(.*?)<\/body>/i, // <body> and the first available </body>, with backrefs: 1) body attributes 2) contents
        
            // match the supplied document
            doctypeMatch = html.match(doctypeRegex),
            htmlAttrMatch = html.match(htmlAttrRegex),
            headMatch = html.match(headRegex),
            bodyMatch = html.match(bodyRegex),
            
            // grab attributes and contents of components
            // NOTE: attributes are deliberately left untrimmed
            doctype = doctypeMatch ? doctypeMatch[0] : doctypeDefault,
            htmlAttr = htmlAttrMatch ? htmlAttrMatch[1] : '',
            
            headAttr = headMatch ? headMatch[1] : '',
            headContents = headMatch ? trim(headMatch[2]) : '',
            
            charsetMatch = headContents.match(charsetRegex),
            charsetTag = charsetMatch ? trim(charsetMatch[0]) : charsetMetaDefault,
            charset = charsetMatch ? (charsetMatch[1] || charsetMatch[2]) : charsetDefault, // Is it a bad idea to have a default charset?
            
            titleMatch = headContents.match(titleRegex),
            title = trim(titleMatch ? titleMatch[2] : titleDefault),
            
            bodyAttr = bodyMatch ? bodyMatch[1] : '',
            bodyContents = trim(bodyMatch ? bodyMatch[2] : (doctypeMatch || headMatch ? '' : html));
        
        if (!titleMatch){
            headContents = '<title></title>' + headContents;
        }
        if (!charsetMatch){
            headContents = charsetTag + headContents;
        }
        
        // document reference object
        this.doctype = doctype;
        this.htmlAttr = htmlAttr;
        
        this.headAttr = headAttr;
        this.headContents = headContents;
        
        this.charset = charset;
        this.title = title;
        
        this.bodyAttr = bodyAttr;
        this.bodyContents = bodyContents;
    }
    
    // Prototype
    Splitdoc.prototype = {
        // construct <head> markup
        head: function(){
            return '<head' + this.headAttr + '>' + this.headContents + '</head>';
        },
        // construct <body> markup
        body: function(){
            return '<body' + this.bodyAttr + '>' + this.bodyContents + '</body>';
        },
        // enhance the object's string representation, by overriding Object prototype's toString function
        toString: function(){
            return this.doctype + '<html' + this.htmlAttr + '>' + this.head() + this.body() + '</html>';
        }
    };
    
    function splitdoc(html, defaults){
        return new Splitdoc(html, defaults);
    }
    
    return (exports.splitdoc = splitdoc);
}());
