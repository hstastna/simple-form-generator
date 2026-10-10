import { FormConfig } from '@/schemas/formConfigSchema';
import { RESET_CONFIRM_MESSAGE } from '@/constants';
import { isEventHandlerName } from '@/formActions';
import { getValidationRules, ValidationRules } from '@/utils';

type FormField = FormConfig['items'][number];
type FormButton = FormConfig['buttons'][number];

const MAX_LINE_LENGTH = 80;
const INDENT = '  ';
const REQUIRED_MARK = '<span aria-hidden="true"> *</span>';

const identifierPattern = /^[A-Za-z_$][\w$]*$/;
// react-hook-form reads these characters in a field name as a nested path
const fieldPathPattern = /[.[\]'"]/;

const fieldOwnKeys = [
  'id',
  'type',
  'label',
  'options',
  'text',
  'onChange',
  'onBlur',
  'aria-describedby',
  // register() overwrites name with the id, in the Result tab too
  'name',
];

const referenceHandler = (name: string, usedHandlers: Set<string>) => {
  usedHandlers.add(name);

  return `handlers.${name}`;
};

const indentLines = (text: string, indent: string) =>
  text.split('\n').map((line) => `${indent}${line}`);

const formatString = (value: string) =>
  /["&\n\r]/.test(value) ? `{${JSON.stringify(value)}}` : `"${value}"`;

const formatObject = (value: object) => {
  const entries = Object.entries(value).map(
    ([key, entry]) =>
      `${identifierPattern.test(key) ? key : JSON.stringify(key)}: ${JSON.stringify(entry)}`
  );

  return entries.length ? `{{ ${entries.join(', ')} }}` : '{{}}';
};

const formatAttribute = (name: string, value: unknown) => {
  if (value === true) {
    return name;
  }

  if (typeof value === 'string') {
    return `${name}=${formatString(value)}`;
  }

  if (typeof value === 'object' && value !== null) {
    return `${name}=${formatObject(value)}`;
  }

  return `${name}={${String(value)}}`;
};

const formatAttributes = (
  attributes: object,
  skippedKeys: string[],
  usedHandlers: Set<string>
) =>
  Object.entries(attributes)
    .filter(([key, value]) => !skippedKeys.includes(key) && value !== undefined)
    .map(([key, value]) =>
      isEventHandlerName(key)
        ? `${key}={${referenceHandler(String(value), usedHandlers)}}`
        : formatAttribute(key, value)
    );

const formatJsxText = (text: string) =>
  text === text.trim() && !/[{}<>&"'\n\r]/.test(text)
    ? text
    : `{${JSON.stringify(text)}}`;

// Prettier moves an overflowing condition, such as aria-describedby, onto its own line
const breakLongCondition = (attribute: string, indent: string) => {
  const [, name, condition] =
    /^([\w-]+)=\{([^"{].* \? .+)\}$/.exec(attribute) ?? [];

  return condition && indent.length + attribute.length > MAX_LINE_LENGTH
    ? `${name}={\n${INDENT}${condition}\n}`
    : attribute;
};

const formatTag = (
  opening: string,
  attributes: string[],
  ending: string,
  indent: string
) => {
  const line = `${indent}${opening}${attributes.map((attribute) => ` ${attribute}`).join('')}${ending}`;

  if (line.length <= MAX_LINE_LENGTH && !line.includes('\n')) {
    return [line];
  }

  const attributeIndent = indent + INDENT;

  return [
    `${indent}${opening}`,
    ...attributes.flatMap((attribute) =>
      indentLines(
        breakLongCondition(attribute, attributeIndent),
        attributeIndent
      )
    ),
    `${indent}${ending.trimStart()}`,
  ];
};

const formatSelfClosingElement = (
  tag: string,
  attributes: string[],
  indent: string
) => formatTag(`<${tag}`, attributes, ' />', indent);

// Prettier breaks an element whose children include a tag or that has 2+ attributes
const formatTextElement = (
  tag: string,
  attributes: string[],
  children: string[],
  indent: string,
  hasTagChild = false
) => {
  const closing = `</${tag}>`;

  if (!children.length) {
    return formatTag(`<${tag}`, attributes, `>${closing}`, indent);
  }

  const opening = formatTag(`<${tag}`, attributes, '>', indent);
  const line = `${opening[0]}${children[0]}${closing}`;

  if (
    !hasTagChild &&
    children.length === 1 &&
    attributes.length <= 1 &&
    opening.length === 1 &&
    line.length <= MAX_LINE_LENGTH
  ) {
    return [line];
  }

  return [
    ...opening,
    ...children.map((child) => `${indent}${INDENT}${child}`),
    `${indent}${closing}`,
  ];
};

const formatContainer = (
  tag: string,
  attributes: string[],
  children: string[],
  indent: string
) => [
  ...formatTag(`<${tag}`, attributes, '>', indent),
  ...children,
  `${indent}</${tag}>`,
];

const formatCaption = (
  tag: 'label' | 'legend',
  attributes: string[],
  text: string,
  isRequired: boolean,
  indent: string
) => {
  const caption = formatJsxText(text);

  if (!isRequired) {
    return formatTextElement(tag, attributes, [caption], indent);
  }

  const children = caption.startsWith('{')
    ? [caption, REQUIRED_MARK]
    : [`${caption}${REQUIRED_MARK}`];

  return formatTextElement(tag, attributes, children, indent, true);
};

const formatLabel = (
  htmlFor: string,
  text: string | undefined,
  isRequired: boolean,
  indent: string
) =>
  text
    ? formatCaption(
        'label',
        [`htmlFor=${formatString(htmlFor)}`],
        text,
        isRequired,
        indent
      )
    : [];

const formatRuleValue = (value: boolean | number | string | RegExp) => {
  if (value instanceof RegExp) {
    return `new RegExp(${JSON.stringify(value.source)}, ${JSON.stringify(value.flags)})`;
  }

  return typeof value === 'string' ? JSON.stringify(value) : String(value);
};

const formatRuleEntries = (rules: ValidationRules) =>
  Object.entries(rules).flatMap(([key, rule]) => {
    if (typeof rule === 'boolean') {
      return [`${key}: ${rule},`];
    }

    if (key === 'required') {
      return rule.value ? [`required: ${JSON.stringify(rule.message)},`] : [];
    }

    return [
      `${key}: {`,
      `${INDENT}value: ${formatRuleValue(rule.value)},`,
      `${INDENT}message: ${JSON.stringify(rule.message)},`,
      '},',
    ];
  });

const formatRegister = (id: string, options: string[]) =>
  options.length
    ? [
        `{...register(${JSON.stringify(id)}, {`,
        ...options.map((line) => `${INDENT}${line}`),
        '})}',
      ].join('\n')
    : `{...register(${JSON.stringify(id)})}`;

const formatErrorAria = (
  errorRef: string,
  errorId: string,
  describedBy: string | undefined
) => [
  `aria-invalid={${errorRef} ? "true" : undefined}`,
  `aria-describedby={${errorRef} ? ${JSON.stringify(describedBy ? `${describedBy} ${errorId}` : errorId)} : ${describedBy ? JSON.stringify(describedBy) : 'undefined'}}`,
];

const formatField = (
  field: FormField,
  index: number,
  usedHandlers: Set<string>,
  indent: string
) => {
  const id = field.id || `field-${index}`;
  const options = field.type === 'radio' ? field.options : undefined;
  const required = field.required || options?.some((option) => option.required);
  const rules = getValidationRules({ ...field, required });
  const isRequired = rules.required.value;

  const errorId = `${id}-error`;
  const errorRef = fieldPathPattern.test(id)
    ? `get(errors, ${JSON.stringify(id)})`
    : identifierPattern.test(id)
      ? `errors.${id}`
      : `errors[${JSON.stringify(id)}]`;
  const fieldAria = formatErrorAria(
    errorRef,
    errorId,
    field['aria-describedby']
  );

  const eventOptions = (['onChange', 'onBlur'] as const).flatMap((key) => {
    const handlerName = field[key];

    return handlerName
      ? [`${key}: ${referenceHandler(handlerName, usedHandlers)},`]
      : [];
  });
  const register = formatRegister(id, [
    ...formatRuleEntries(rules),
    ...eventOptions,
  ]);

  const childIndent = indent + INDENT;
  const idAttribute = `id=${formatString(id)}`;

  const formatInput = () =>
    formatSelfClosingElement(
      'input',
      [
        idAttribute,
        `type="${field.type}"`,
        ...formatAttributes(field, fieldOwnKeys, usedHandlers),
        ...fieldAria,
        register,
      ],
      childIndent
    );

  const formatControl = () => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return [
          ...formatLabel(id, field.label, isRequired, childIndent),
          ...formatInput(),
        ];

      case 'textarea':
        return [
          ...formatLabel(id, field.label, isRequired, childIndent),
          ...formatSelfClosingElement(
            'textarea',
            [
              idAttribute,
              ...formatAttributes(field, fieldOwnKeys, usedHandlers),
              ...fieldAria,
              ...(field.text === undefined
                ? []
                : [formatAttribute('defaultValue', field.text)]),
              register,
            ],
            childIndent
          ),
        ];

      case 'checkbox':
        return [
          ...formatInput(),
          ...formatLabel(id, field.label, isRequired, childIndent),
        ];

      case 'radio': {
        if (!options) {
          return [
            ...formatInput(),
            ...formatLabel(id, field.label, isRequired, childIndent),
          ];
        }

        const {
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledBy,
          autoFocus,
          ...optionDefaults
        } = field;
        const optionIndent = childIndent + INDENT + INDENT;

        const optionBlocks = options.flatMap((option, optionIndex) => {
          const { id: ownId, label: optionLabel, ...ownAttributes } = option;
          const optionId = ownId || `${id}-${optionIndex}`;
          const attributes = {
            ...(autoFocus && optionIndex === 0 && { autoFocus }),
            ...optionDefaults,
            ...ownAttributes,
          };

          return formatContainer(
            'div',
            [],
            [
              ...formatSelfClosingElement(
                'input',
                [
                  `id=${formatString(optionId)}`,
                  'type="radio"',
                  ...formatAttributes(attributes, fieldOwnKeys, usedHandlers),
                  ...formatErrorAria(
                    errorRef,
                    errorId,
                    option['aria-describedby'] ?? field['aria-describedby']
                  ),
                  register,
                ],
                optionIndent
              ),
              ...formatLabel(optionId, optionLabel, false, optionIndent),
            ],
            childIndent + INDENT
          );
        });

        return formatContainer(
          'fieldset',
          [
            'role="radiogroup"',
            ...formatAttributes(
              { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy },
              [],
              usedHandlers
            ),
            ...fieldAria,
          ],
          [
            ...(field.label
              ? formatCaption(
                  'legend',
                  [],
                  field.label,
                  isRequired,
                  childIndent + INDENT
                )
              : []),
            ...optionBlocks,
          ],
          childIndent
        );
      }
    }
  };

  return formatContainer(
    'div',
    [],
    [
      ...formatControl(),
      `${childIndent}{${errorRef} && (`,
      `${childIndent}${INDENT}<p id=${formatString(errorId)} role="alert">`,
      `${childIndent}${INDENT}${INDENT}{${errorRef}.message}`,
      `${childIndent}${INDENT}</p>`,
      `${childIndent})}`,
    ],
    indent
  );
};

const formatButton = (
  button: FormButton,
  usedHandlers: Set<string>,
  indent: string
) => {
  const { text, type = 'button', ...attributes } = button;
  const implicitReset =
    type === 'reset' && !attributes.onClick
      ? [`onClick={${referenceHandler('reset', usedHandlers)}}`]
      : [];

  return formatTextElement(
    'button',
    [
      `type="${type}"`,
      ...implicitReset,
      ...formatAttributes(attributes, [], usedHandlers),
    ],
    text ? [formatJsxText(text)] : [],
    indent
  );
};

const formatHandler = (name: string, isOnResetButton: boolean) => {
  switch (name) {
    case 'reset':
      return [
        'reset: (event: SyntheticEvent) => {',
        '  event.preventDefault();',
        '',
        '  if (',
        '    window.confirm(',
        `      ${JSON.stringify(RESET_CONFIRM_MESSAGE)}`,
        '    )',
        '  ) {',
        '    reset();',
        '  }',
        '},',
      ];

    case 'clear':
      return ['clear: () => reset(),'];

    default:
      return [
        `${name}: () => {`,
        `  // TODO: implement ${JSON.stringify(name)}`,
        // a native reset skips react-hook-form, which then submits stale values
        ...(isOnResetButton ? ['  reset();'] : []),
        '},',
      ];
  }
};

const formatUseForm = (hasFields: boolean, usesReset: boolean) => {
  const names = [
    ...(hasFields ? ['register'] : []),
    'handleSubmit',
    ...(usesReset ? ['reset'] : []),
  ];

  if (!hasFields) {
    return [`  const { ${names.join(', ')} } = useForm<FormValues>();`];
  }

  return [
    '  const {',
    ...names.map((name) => `    ${name},`),
    '    formState: { errors },',
    '  } = useForm<FormValues>();',
  ];
};

export const generateFormCode = (config: FormConfig): string => {
  const usedHandlers = new Set<string>();
  const bodyIndent = INDENT.repeat(3);

  const blocks = [
    formatTextElement(
      'h2',
      ['id="form-title"'],
      [formatJsxText(config.title || 'Generated form')],
      bodyIndent
    ),
    ...config.items.map((field, index) =>
      formatField(field, index, usedHandlers, bodyIndent)
    ),
  ];

  if (config.buttons.length) {
    blocks.push(
      formatContainer(
        'div',
        [],
        config.buttons.flatMap((button) =>
          formatButton(button, usedHandlers, bodyIndent + INDENT)
        ),
        bodyIndent
      )
    );
  }

  const resetButtonHandlers = new Set(
    config.buttons.flatMap((button) =>
      button.type === 'reset' && button.onClick ? [button.onClick] : []
    )
  );
  const usesReset =
    resetButtonHandlers.size > 0 ||
    usedHandlers.has('reset') ||
    usedHandlers.has('clear');
  const usesGet = config.items.some(
    (field) => field.id && fieldPathPattern.test(field.id)
  );
  const handlers = [...usedHandlers].flatMap((name) =>
    formatHandler(name, resetButtonHandlers.has(name))
  );

  const lines = [
    '"use client";',
    '',
    ...(usedHandlers.has('reset')
      ? ['import { SyntheticEvent } from "react";']
      : []),
    `import { ${usesGet ? 'get, ' : ''}useForm } from "react-hook-form";`,
    '',
    'type FormValues = Record<string, string | number | boolean>;',
    '',
    'export const GeneratedForm = () => {',
    ...formatUseForm(config.items.length > 0, usesReset),
    '',
    ...(handlers.length
      ? [
          '  const handlers = {',
          ...handlers.map((line) => (line ? `    ${line}` : line)),
          '  };',
          '',
        ]
      : []),
    '  const onSubmit = (data: FormValues) => {',
    '    // TODO: send the data',
    '    console.log(data);',
    '  };',
    '',
    '  return (',
    ...formatContainer(
      'form',
      [
        'onSubmit={handleSubmit(onSubmit)}',
        'noValidate',
        'aria-labelledby="form-title"',
      ],
      blocks.flatMap((block, index) => (index ? ['', ...block] : block)),
      INDENT.repeat(2)
    ),
    '  );',
    '};',
  ];

  return `${lines.join('\n')}\n`;
};
