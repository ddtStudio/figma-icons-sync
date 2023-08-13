#! /usr/bin/env node
const fs = require('node:fs');
const PKG = require('../package.json');
const { program } = require('commander');
const colors = require('colors');
const { extractIds, _defaultSVGoSettins } = require('./utils');
const FigmaSync = require('./sync');

program
    .name('icons-sync')
    .description(PKG.description)
    .version(PKG.version, '-v, --version')
    .arguments('[FIGMA-LINK]')
    .requiredOption('-t, --token <STRING>', 'Figma API token, ' + 'required'.yellow)
    .option('-i, --input <FIGMA-LINK>', 'input link to Figma frame containing components of icons, ' + 'required'.yellow)
    .option(
        '-o, --output <OUTPUT>',
        'output folder',
        './icons/'
    )
    .option('--svgo-conf <CONFIG>', 'custom SVGo config file, only .json is supported')
    .option(
        '--monochrome-colors <COLORS>', 
        'list of monochromatic colors. An icon will be considered monochrome if it filled with one of these colors',
        'black,000000'
    ) 
    .option(
        '--remove-fill', 
        'remove fill="color" from SVG if the icon is considered monochrome',
        true
    )
    .option(
        '-q, --quiet',
        'output only critical error messages',
        false
    )
    .option(
        '-f, --force',
        'force re-fetch all icons ignoring the icons stored locally',
        false
    )
    .option('--no-color', 'output plain text without color')
    .action((str, opts) => {
        const { fileId, nodeId } = extractIds(str);

        let svgoConf = false;
        if('svgoConf' in opts) {
            if(fs.existsSync(opts.svgoConf)) {
                svgoConf = JSON.parse(fs.readFileSync(opts.svgoConf));
            } else {
                throw new Error(`SVGo config file '${opts.svgoConf}' does not exist`);
            }
        }
        const options = {
            token: opts.token,
            outputDirectory: opts.output,

            monochrome: {
                colors: opts.monochromeColors.split(','),
                removeFill: opts.removeFill,
            },
    
            fileId: fileId,
            nodeId: nodeId,

            cli: {
                enabled: true,
                quiet: opts.quiet
            },

            svgoConfig: svgoConf !== false ? svgoConf : _defaultSVGoSettins
        };
    
        const syncer = new FigmaSync(options);
    
        syncer.revalidateLocalChanges();
        syncer.extractIcons(opts.force);

    });

program.parse();