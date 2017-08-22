#!/usr/bin/env node --harmony

const got = require('got');
const commandLineArgs = require('command-line-args');

(async ()=>{
  const optionDefinitions = [
    { name: 'path', alias: 'p', type: String }, // TemplateMonster/PlasmaPlatform/Frontend/Plasma-Vendors
    { name: 'token', alias: 'a', type: String }, // From user profile
    { name: 'from', alias: 'f', type: String }, // Feature branch name`
    { name: 'to', alias: 't', type: String }, // Release branch name
    { name: 'message', alias: 'm', type: String } // Release branch name
  ];

  const options = commandLineArgs(optionDefinitions);

  if (options.from === undefined) throw Error('Source branch undefined');

  if (options.to === undefined) throw Error('Target branch undefined');

  if (options.message === undefined) throw Error('Merge request title undefined');

  const path = (options.path !== undefined) ? options.path : process.env.GITLAB_PATH;
  if (path === undefined) throw Error('Project path undefined');

  const token = (options.token !== undefined) ? options.token : process.env.GITLAB_TOKEN;
  if (token === undefined) throw Error('Token undefined');

  const response = await got(`https://gitlab.com/api/v4/projects/${encodeURIComponent(path)}`,{
    headers: {'PRIVATE-TOKEN': token}
  });
  const projectID = (JSON.parse(response.body)).id;
  if (projectID === undefined) throw Error('Wrong project path');

  console.log('data: ', {
    id: projectID,
    source_branch: options.from,
    target_branch: options.to,
    title: options.message,
  });

  const result = await got.post(`https://gitlab.com/api/v4/projects/${projectID}/merge_requests`,{
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: projectID,
      source_branch: options.from,
      target_branch: options.to,
      title: options.message,
    }),
  });

  if (result.statusCode === 201) {
    console.log('Created');
  } else {
    throw new Error(`${result.statusCode}: ${result.statusMessage}`);
  }

})();
