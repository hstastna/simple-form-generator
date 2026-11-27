import { describe, it, expect } from '@jest/globals';
import { DEFAULT_FORM_CONFIG } from '@/constants';
import { generateFormHtml } from '@/generateFormHtml';
import { formConfigSchema } from '@/schemas/formConfigSchema';

const generate = (config: unknown) =>
  generateFormHtml(formConfigSchema.parse(config));

describe('generateFormHtml', () => {
  it('generates the HTML for the default config', () => {
    expect(generate(JSON.parse(DEFAULT_FORM_CONFIG)))
      .toBe(`<form aria-labelledby="form-title">
  <h2 id="form-title">Sample Form</h2>

  <div>
    <label for="name">Name<span aria-hidden="true"> *</span></label>
    <input
      id="name"
      name="name"
      type="text"
      placeholder="Enter your name"
      required
    />
  </div>

  <div>
    <input id="newsletter" name="newsletter" type="checkbox" />
    <label for="newsletter">Subscribe to the newsletter</label>
  </div>

  <div>
    <button type="reset">Cancel</button>
    <button type="submit">Save</button>
  </div>
</form>
`);
  });

  it('renders the other input types like a text input', () => {
    expect(
      generate({
        items: [{ id: 'mail', type: 'email', label: 'Mail' }],
        buttons: [],
      })
    ).toContain(
      '<label for="mail">Mail</label>\n    <input id="mail" name="mail" type="email" />'
    );
  });

  it('converts React attribute names and values to HTML', () => {
    const html = generate({
      items: [
        {
          id: 'nick',
          type: 'text',
          label: 'Nick',
          className: 'wide',
          style: { backgroundColor: 'white', '--accentColor': 'red' },
          spellCheck: false,
          maxLength: 10,
          readOnly: true,
          disabled: false,
          defaultValue: 'Bob',
        },
        { id: 'agree', type: 'checkbox', label: 'Agree', defaultChecked: true },
      ],
      buttons: [],
    });

    expect(html).toContain(`    <input
      id="nick"
      name="nick"
      type="text"
      class="wide"
      style="background-color: white; --accentColor: red;"
      spellcheck="false"
      maxlength="10"
      readonly
      value="Bob"
    />`);
    expect(html).toContain(
      '<input id="agree" name="agree" type="checkbox" checked />'
    );
    expect(html).not.toContain('disabled');
  });

  it('escapes text and attribute values', () => {
    const html = generate({
      title: 'Tom & "Jerry" <3>',
      items: [
        {
          id: 'bio',
          type: 'textarea',
          label: 'A & B <c>',
          placeholder: 'say "hi"',
          text: 'a </textarea> & b',
        },
      ],
      buttons: [],
    });

    expect(html).toContain(
      '<h2 id="form-title">Tom &amp; &quot;Jerry&quot; &lt;3&gt;</h2>'
    );
    expect(html).toContain('<label for="bio">A &amp; B &lt;c&gt;</label>');
    expect(html).toContain('placeholder="say &quot;hi&quot;"');
    expect(html).toContain('>a &lt;/textarea&gt; &amp; b</textarea>');
  });

  it('keeps a newline in an attribute value without indenting it', () => {
    const html = generate({
      items: [{ id: 'note', type: 'text', label: 'Note', title: 'one\ntwo' }],
      buttons: [],
    });
    document.body.innerHTML = html;

    expect(document.getElementById('note')?.title).toBe('one\ntwo');
  });

  it('lets value and checked win over defaultValue and defaultChecked', () => {
    const html = generate({
      items: [
        {
          id: 'plan',
          type: 'radio',
          label: 'Plan',
          defaultValue: 'pro',
          defaultChecked: true,
          checked: false,
          options: [{ value: 'basic' }, { value: 'pro' }],
        },
      ],
      buttons: [],
    });
    document.body.innerHTML = html;
    const radios = [
      ...document.querySelectorAll<HTMLInputElement>('input[name="plan"]'),
    ];

    expect(radios.map((radio) => radio.value)).toEqual(['basic', 'pro']);
    expect(radios.some((radio) => radio.checked)).toBe(false);
  });

  it('disables every option of a disabled radio group', () => {
    document.body.innerHTML = generate({
      items: [
        {
          id: 'plan',
          type: 'radio',
          label: 'Plan',
          disabled: true,
          options: [{ value: 'basic', disabled: false }, { value: 'pro' }],
        },
      ],
      buttons: [],
    });

    expect(
      [...document.querySelectorAll('input')].map((radio) => radio.disabled)
    ).toEqual([true, true]);
  });

  it('leaves out handlers and the config name, keeps a user aria-describedby', () => {
    const html = generate({
      items: [
        {
          id: 'city',
          type: 'text',
          label: 'City',
          name: 'town',
          onFocus: 'default',
          onChange: 'trackChange',
          'aria-describedby': 'city-hint',
        },
      ],
      buttons: [{ text: 'Clear', onClick: 'clear' }],
    });

    expect(html).toContain(
      '<input id="city" name="city" type="text" aria-describedby="city-hint" />'
    );
    expect(html).toContain('<button type="button">Clear</button>');
    expect(html).not.toMatch(/town|\son\w+=/);
  });

  it('renders a radio group as a fieldset of options', () => {
    document.body.innerHTML = generate({
      items: [
        {
          id: 'plan',
          type: 'radio',
          label: 'Plan',
          'aria-label': 'Plans',
          'aria-describedby': 'plan-hint',
          className: 'choice',
          name: 'p',
          autoFocus: true,
          options: [
            { value: 'basic', label: 'Basic' },
            {
              id: 'plan-pro',
              value: 'pro',
              label: 'Pro',
              className: 'choice-pro',
              required: true,
            },
            { value: 'team', label: 'Team' },
          ],
        },
      ],
      buttons: [],
    });
    const radios = [...document.querySelectorAll('input')];

    expect(document.querySelector('fieldset')?.outerHTML).toMatch(
      /^<fieldset role="radiogroup" aria-label="Plans" aria-describedby="plan-hint">\s*<legend>Plan<span aria-hidden="true"> \*<\/span><\/legend>/
    );
    expect(
      radios.map(({ id, name, className }) => [id, name, className])
    ).toEqual([
      ['plan-0', 'plan', 'choice'],
      ['plan-pro', 'plan', 'choice-pro'],
      ['plan-2', 'plan', 'choice'],
    ]);
    expect(radios.map((radio) => radio.hasAttribute('autofocus'))).toEqual([
      true,
      false,
      false,
    ]);
    expect(
      [...document.querySelectorAll('label')].map((label) => label.innerHTML)
    ).toEqual(['Basic', 'Pro', 'Team']);
  });

  it('round-trips through the browser HTML parser', () => {
    const intro = '\nstarts on the second line';
    const notes = 'a </textarea> & "b"';

    document.body.innerHTML = generate({
      items: [
        { id: 'name', type: 'text', label: 'Name', required: true },
        { id: 'intro', type: 'textarea', label: 'Intro', text: intro },
        { id: 'notes', type: 'textarea', label: 'Notes', text: notes },
        { id: 'agree', type: 'checkbox', label: 'Agree' },
        {
          id: 'plan',
          type: 'radio',
          label: 'Plan',
          options: [
            { value: 'basic', label: 'Basic' },
            { value: 'pro', label: 'Pro' },
          ],
        },
      ],
      buttons: [{ text: 'Send', type: 'submit' }],
    });
    const form = document.forms[0];
    const [name, agree, basic] = form.querySelectorAll('input');

    expect(
      [
        ...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'input, textarea'
        ),
      ].map((control) => control.labels?.length)
    ).toEqual([1, 1, 1, 1, 1, 1]);
    expect(
      [...form.querySelectorAll('textarea')].map(({ value }) => value)
    ).toEqual([intro, notes]);
    expect(form.checkValidity()).toBe(false);

    name.value = 'Ada';
    agree.checked = true;
    basic.checked = true;

    expect(form.checkValidity()).toBe(true);
    expect([...new FormData(form).keys()]).toEqual([
      'name',
      'intro',
      'notes',
      'agree',
      'plan',
    ]);
  });
});
