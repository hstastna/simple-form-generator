## Simple Form Generator

![Simple Form Generator](./public/fox-image.png)

Simple Form Generator is an app for you to generate forms for your apps, based on a specified JSON configuration.

The application consists of two tabs:
_Config_ – to add the form configuration in JSON format
_Result_ – to display the form

When a text is inserted in the _Config_ tab text area (uses `CodeMirror` from _react-codemirror_ package), it is validated automatically: the correctness of the JSON format itself as well as the specific configuration with proper values. If the problems occur, you'll be informed briefly by formatted error messages right below the text area.

If no error occurs after inserting the configuration, you can click on _Result_ tab to see the result.
You can test your forms by entering the values into appropriate fields.

The project uses also [React Hook Form](https://react-hook-form.com/) library, hence the validation of the form data comes with it.

The generator uses Tailwind CSS and is quite good adapted also for your mobile phone screen.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## JSON format

The JSON configuration object consists of three main keys:

`title` - represents the main title of the form
`items` - the actual form fields of various types, such as:

- `number` - number field
- `text` - text field
- `textarea` - text area
- `checkbox` - checkbox field
- `date` - date field
- `radio` - radio button
  `buttons` - form buttons of type: `button`, `submit`, `reset`

The JSON configuration entered in the _Config_ tab is validated by using [Zod](https://zod.dev/). You can find the specific schemas defined in the _src/schemas_ directory. Most of the common html attributes for `input`, `textarea` and `button` HTML elements are accepted.

## Getting Started

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Unit tests

To run the unit tests, run:

```bash
npm test
```

## Further suggestions/coming soon:

This project is very fresh, hence lots of improvements can be done, for example:

- add "Code" tab to simply copy the React/TypeScript code for the generated forms
- allow other input types to be accepted, like type of button, submit, reset, email, password etc.
- make the data entered in the generated forms persistent while switching between the tabs, even before clicking on Submit button (can be useful when playing with the various data and setting the proper JSON attributes to make the inputs work as expected)
- improve state management, consider getting rid of the Context eventually
- improve the existing accessibility
- add more unit tests
- fix misleading console errors when running unit tests that suggest to wrap the code that causes React state updates into `act(...)`, but `act` is deprecated
- add detailed documentation and examples for advanced usage

Maybe a bit later:

- add internationalization (i18n) support for multiple languages
- implement a drag-and-drop interface for building forms
- enhance the UI/UX with more themes and customization options
- provide a library of pre-built form templates

I appreciate your interest and support as I continue to enhance and expand this project. Enjoy using the Simple Form Generator!
