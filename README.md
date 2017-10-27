# Frontend Nanodegree Neighborhood Map

This repository is a project submission for Udacity's Frontend Nanodegree course.
The Neighborhood Map application aims to provide numerous features when browsing
a location while being mobile responsive.

## Getting Started

Live versions of this project can be viewed at the following links

[Optimized Live Version](https://logic0verflow.github.io/frontend-nanodegree-neighborhood-map/dist/index.html)

[Unoptimized Live Version](https://logic0verflow.github.io/frontend-nanodegree-neighborhood-map/src/index.html)

Obtain a copy of the project by either downloading a zipped version or using
the below command in a terminal with git installed.

```
git clone https://github.com/logic0verflow/frontend-nanodegree-neighborhood-map.git
```

This project relies on node.js and uses Grunt when developing the distribution
ready version of the project (dist) from the original source folder (src). At
the time of this writing, the project is built using node.js version 6.11.3 and
npm version 3.10.10. Ensure npm and the Grunt CLI packages are installed.

The application has only one HTML file __index.html__ that users open and
interact with.

### Building for Distribution

A Gruntfile.js file is included with the current set of optimization task to
automate. Some of these task include;

* compressing/optimizing images
* cleaning out old file versions for newer versions
* renaming files back to their original names to ensure references are kept the
same
* minifying of HTML, CSS, and Javascript

To perform all these task, first ensure the packages are installed via npm
which relies on the *package.json* file. Navigate to the project root in a
terminal (the location should contain the *package.json* file) and run the
command below to setup the packages needed for the grunt task.

```
npm i
```

Once all the packages are installed, simply run the default grunt task using
the command below.

```
grunt
```

When the task completes, the directory **dist** will contain all the files that
were modified by Grunt.
