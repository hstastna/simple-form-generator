import { FormConfig } from '@/schemas/formConfigSchema';
import { isEventHandlerName } from '@/formActions';
import {
  formatContainer,
  formatSelfClosingElement,
  formatTag,
  formatTextElement,
  INDENT,
  REQUIRED_MARK,
} from '@/generateFormCode';
import { getValidationRules } from '@/utils';

type FormField = FormConfig['items'][number];

const fieldOwnKeys = ['id', 'type', 'label', 'options', 'text', 'name'];
const enumeratedAttributes = ['draggable', 'contenteditable', 'spellcheck'];
const attributeNames: Record<string, string> = {
  className: 'class',
  defaultValue: 'value',
  defaultChecked: 'checked',
};
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (character) => htmlEntities[character]);

const formatStyle = (style: object) =>
  Object.entries(style)
    .map(
      ([property, value]) =>
        `${property.startsWith('--') ? property : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${value};`
    )
    .join(' ');

const formatAttributes = (attributes: object, skippedKeys: string[] = []) =>
  Object.entries(attributes).flatMap(([key, value]) => {
    if (
      value === undefined ||
      skippedKeys.includes(key) ||
      isEventHandlerName(key)
    ) {
      return [];
    }

    const name = attributeNames[key] ?? key.toLowerCase();

    // as in React, "value" and "checked" win over "defaultValue" and "defaultChecked"
    if (name !== key && name in attributes) {
      return [];
    }

    if (typeof value === 'boolean' && !enumeratedAttributes.includes(name)) {
      return value ? [name] : [];
    }

    // formatTag would indent a raw newline into the value
    return [
      `${name}="${escapeHtml(typeof value === 'object' ? formatStyle(value) : String(value)).replace(/\n/g, '&#10;')}"`,
    ];
  });

const formatLabel = (
  htmlFor: string,
  text: string | undefined,
  isRequired: boolean,
  indent: string
) =>
  text
    ? formatTextElement(
        'label',
        [`for="${escapeHtml(htmlFor)}"`],
        [`${escapeHtml(text)}${isRequired ? REQUIRED_MARK : ''}`],
        indent
      )
    : [];

const formatField = (field: FormField, index: number) => {
  const id = field.id || `field-${index}`;
  const options = field.type === 'radio' ? field.options : undefined;
  const required = field.required || options?.some((option) => option.required);
  const isRequired = getValidationRules({ ...field, required }).required.value;

  const formatInput = (indent: string) =>
    formatSelfClosingElement(
      'input',
      [
        ...formatAttributes({ id, name: id, type: field.type }),
        ...formatAttributes(field, fieldOwnKeys),
      ],
      indent
    );

  if (field.type === 'hidden') {
    return formatInput(INDENT);
  }

  const childIndent = INDENT + INDENT;
  const label = formatLabel(id, field.label, isRequired, childIndent);

  const formatControl = () => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'email':
      case 'password':
      case 'search':
      case 'tel':
      case 'url':
      case 'time':
      case 'datetime-local':
      case 'month':
      case 'week':
      case 'color':
      case 'range':
      case 'file':
        return [...label, ...formatInput(childIndent)];

      case 'textarea':
        return [
          ...label,
          ...formatTag(
            '<textarea',
            [
              ...formatAttributes({ id, name: id }),
              ...formatAttributes(field, fieldOwnKeys),
            ],
            // the HTML parser drops a newline right after <textarea>
            `>${field.text?.startsWith('\n') ? '\n' : ''}${escapeHtml(field.text ?? '')}</textarea>`,
            childIndent
          ),
        ];

      case 'checkbox':
        return [...formatInput(childIndent), ...label];

      case 'radio': {
        if (!options) {
          return [...formatInput(childIndent), ...label];
        }

        const {
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledBy,
          autoFocus,
          ...optionDefaults
        } = field;
        const optionIndent = childIndent + INDENT + INDENT;

        return formatContainer(
          'fieldset',
          [
            'role="radiogroup"',
            ...formatAttributes({
              'aria-label': ariaLabel,
              'aria-labelledby': ariaLabelledBy,
              'aria-describedby': field['aria-describedby'],
            }),
          ],
          [
            ...(field.label
              ? formatTextElement(
                  'legend',
                  [],
                  [
                    `${escapeHtml(field.label)}${isRequired ? REQUIRED_MARK : ''}`,
                  ],
                  childIndent + INDENT
                )
              : []),
            ...options.flatMap((option, optionIndex) => {
              const optionId = option.id || `${id}-${optionIndex}`;

              return formatContainer(
                'div',
                [],
                [
                  ...formatSelfClosingElement(
                    'input',
                    [
                      ...formatAttributes({
                        id: optionId,
                        name: id,
                        type: 'radio',
                      }),
                      ...formatAttributes(
                        {
                          ...(autoFocus && optionIndex === 0 && { autoFocus }),
                          ...optionDefaults,
                          ...option,
                          // register() in React disables every option of a disabled group
                          ...(field.disabled && { disabled: true }),
                        },
                        fieldOwnKeys
                      ),
                    ],
                    optionIndent
                  ),
                  ...formatLabel(optionId, option.label, false, optionIndent),
                ],
                childIndent + INDENT
              );
            }),
          ],
          childIndent
        );
      }
    }
  };

  return formatContainer('div', [], formatControl(), INDENT);
};

export const generateFormHtml = (config: FormConfig): string => {
  const blocks = [
    formatTextElement(
      'h2',
      ['id="form-title"'],
      [escapeHtml(config.title || 'Generated form')],
      INDENT
    ),
    ...config.items.map(formatField),
  ];

  if (config.buttons.length) {
    blocks.push(
      formatContainer(
        'div',
        [],
        config.buttons.flatMap(({ text, type = 'button', ...attributes }) =>
          formatTextElement(
            'button',
            [`type="${type}"`, ...formatAttributes(attributes)],
            text ? [escapeHtml(text)] : [],
            INDENT + INDENT
          )
        ),
        INDENT
      )
    );
  }

  return `${formatContainer(
    'form',
    ['aria-labelledby="form-title"'],
    blocks.flatMap((block, index) => (index ? ['', ...block] : block)),
    ''
  ).join('\n')}\n`;
};
