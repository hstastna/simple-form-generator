import { FormConfig } from '@/schemas/formConfigSchema';
import { RESET_CONFIRM_MESSAGE } from '@/constants';
import { isEventHandlerName } from '@/formActions';
import { FormTheme } from '@/formThemes';
import { getValidationRules, ValidationRules } from '@/utils';

type FormField = FormConfig['items'][number];
type FormButton = FormConfig['buttons'][number];
type WatchedDate = {
  id: string;
  variableName: string;
  defaultValue?: string | number;
};

const MAX_LINE_LENGTH = 80;
const INDENT = '  ';
const REQUIRED_MARK = '<span aria-hidden="true"> *</span>';

const identifierPattern = /^[A-Za-z_$][\w$]*$/;
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
  'name',
];

const formatHandlerReference = (name: string, usedHandlers: Set<string>) => {
  usedHandlers.add(name);

  return `handlers.${name}`;
};

const formatWatchedDateReference = (
  id: string,
  defaultValue: string | number | undefined,
  watchedDates: WatchedDate[]
) => {
  const takenNames = new Set(
    watchedDates.map(({ variableName }) => variableName)
  );
  const camelCaseId = id.replace(/[^\w$]+(.)?/g, (_, next = '') =>
    next.toUpperCase()
  );
  let variableName = `${/^\d/.test(camelCaseId) ? '_' : ''}${camelCaseId}Value`;

  while (takenNames.has(variableName)) {
    variableName = `_${variableName}`;
  }

  watchedDates.push({ id, variableName, defaultValue });

  return variableName;
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
        ? `${key}={${formatHandlerReference(String(value), usedHandlers)}}`
        : formatAttribute(key, value)
    );

const formatClassName = (className: string | undefined) =>
  className === undefined ? [] : [formatAttribute('className', className)];

// a className from the JSON config replaces the theme class, as in the Result tab
const formatThemeClassName = (
  className: string | undefined,
  attributes: { className?: string }
) => (attributes.className === undefined ? formatClassName(className) : []);

const formatJsxText = (text: string) =>
  text === text.trim() && !/[{}<>&"'\n\r]/.test(text)
    ? text
    : `{${JSON.stringify(text)}}`;

const breakLongCondition = (attribute: string, indent: string) => {
  const [, name, test, consequent, alternate] =
    /^([\w-]+)=\{([^"{].*?) \? ("(?:[^"\\]|\\.)*") : (.+)\}$/.exec(attribute) ??
    [];

  if (!name || indent.length + attribute.length <= MAX_LINE_LENGTH) {
    return attribute;
  }

  const condition = `${test} ? ${consequent} : ${alternate}`;

  return indent.length + INDENT.length + condition.length <= MAX_LINE_LENGTH
    ? `${name}={\n${INDENT}${condition}\n}`
    : [
        `${name}={`,
        `${INDENT}${test}`,
        `${INDENT}${INDENT}? ${consequent}`,
        `${INDENT}${INDENT}: ${alternate}`,
        '}',
      ].join('\n');
};

const formatTag = (
  opening: string,
  attributes: string[],
  ending: string,
  indent: string
) => {
  const line = `${indent}${opening}${attributes.map((attribute) => ` ${attribute}`).join('')}${ending}`;
  // Prettier never breaks a tag with one string attribute, however long
  const isSingleStringAttribute =
    attributes.length === 1 && /^[\w-]+="/.test(attributes[0]);

  if (
    (line.length <= MAX_LINE_LENGTH || isSingleStringAttribute) &&
    !line.includes('\n')
  ) {
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
  indent: string,
  theme?: FormTheme
) => {
  const caption = formatJsxText(text);

  if (!isRequired) {
    return formatTextElement(tag, attributes, [caption], indent);
  }

  if (theme) {
    const childIndent = indent + INDENT;

    return formatContainer(
      tag,
      attributes,
      [
        `${childIndent}${caption}`,
        ...formatTextElement(
          'span',
          [...formatClassName(theme.requiredMark), 'aria-hidden="true"'],
          ['*'],
          childIndent
        ),
        ...formatTextElement(
          'span',
          formatClassName(theme.requiredText),
          [formatJsxText(' (required)')],
          childIndent
        ),
      ],
      indent
    );
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
  indent: string,
  theme?: FormTheme,
  className?: string
) =>
  text
    ? formatCaption(
        'label',
        [`htmlFor=${formatString(htmlFor)}`, ...formatClassName(className)],
        text,
        isRequired,
        indent,
        theme
      )
    : [];

const formatGridRow = (
  theme: FormTheme,
  rowClassName: string | undefined,
  label: string[],
  control: string[],
  indent: string
) => {
  const cellIndent = indent + INDENT;
  const labelCellClassName = formatClassName(theme.labelCell);

  return formatContainer(
    'div',
    formatClassName(rowClassName),
    [
      ...(label.length
        ? formatContainer('div', labelCellClassName, label, cellIndent)
        : formatTextElement('div', labelCellClassName, [], cellIndent)),
      ...formatContainer(
        'div',
        formatClassName(theme.controlCell),
        control,
        cellIndent
      ),
    ],
    indent
  );
};

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

const formatDateClassName = (
  id: string,
  value: string | number | undefined,
  defaultValue: string | number | undefined,
  theme: FormTheme,
  watchedDates: WatchedDate[]
) => {
  if (value !== undefined) {
    return formatClassName(value ? theme.dateInput : theme.emptyDateInput);
  }

  const variableName = formatWatchedDateReference(
    id,
    defaultValue,
    watchedDates
  );

  return [
    `className={${variableName} ? ${JSON.stringify(theme.dateInput)} : ${JSON.stringify(theme.emptyDateInput)}}`,
  ];
};

const formatField = (
  field: FormField,
  index: number,
  usedHandlers: Set<string>,
  indent: string,
  watchedDates: WatchedDate[],
  theme?: FormTheme
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
      ? [`${key}: ${formatHandlerReference(handlerName, usedHandlers)},`]
      : [];
  });
  const register = formatRegister(id, [
    ...formatRuleEntries(rules),
    ...eventOptions,
  ]);

  const childIndent = indent + INDENT;
  const idAttribute = `id=${formatString(id)}`;

  const formatInput = (className: string[], inputIndent: string) =>
    formatSelfClosingElement(
      'input',
      [
        idAttribute,
        `type="${field.type}"`,
        ...className,
        ...formatAttributes(field, fieldOwnKeys, usedHandlers),
        ...fieldAria,
        register,
      ],
      inputIndent
    );

  const gridChildIndent = theme ? childIndent + INDENT + INDENT : childIndent;

  const formatGridField = (
    rowClassName: string | undefined,
    control: string[]
  ) => {
    const label = formatLabel(
      id,
      field.label,
      isRequired,
      gridChildIndent,
      theme,
      theme?.labelBeforeControl
    );

    return theme
      ? formatGridRow(theme, rowClassName, label, control, childIndent)
      : [...label, ...control];
  };

  const formatChoiceField = (
    rowClassName: string | undefined,
    inputClassName: string | undefined
  ) => {
    const rowChildIndent = theme ? childIndent + INDENT : childIndent;
    const lines = [
      ...formatInput(
        formatThemeClassName(inputClassName, field),
        rowChildIndent
      ),
      ...formatLabel(
        id,
        field.label,
        isRequired,
        rowChildIndent,
        theme,
        theme?.labelAfterControl
      ),
    ];

    return theme
      ? formatContainer(
          'div',
          formatClassName(rowClassName),
          lines,
          childIndent
        )
      : lines;
  };

  const formatControl = () => {
    switch (field.type) {
      case 'text':
      case 'number':
        return formatGridField(
          theme?.textNumDateRow,
          formatInput(
            formatThemeClassName(theme?.textNumDateInput, field),
            gridChildIndent
          )
        );

      case 'date': {
        const className =
          theme && field.className === undefined
            ? formatDateClassName(
                id,
                field.value,
                field.defaultValue,
                theme,
                watchedDates
              )
            : [];

        return formatGridField(
          theme?.textNumDateRow,
          formatInput(className, gridChildIndent)
        );
      }

      case 'textarea':
        return formatGridField(
          theme?.textAreaRow,
          formatSelfClosingElement(
            'textarea',
            [
              idAttribute,
              ...formatThemeClassName(theme?.textArea, field),
              ...formatAttributes(field, fieldOwnKeys, usedHandlers),
              ...fieldAria,
              ...(field.text === undefined
                ? []
                : [formatAttribute('defaultValue', field.text)]),
              register,
            ],
            gridChildIndent
          )
        );

      case 'checkbox':
        return formatChoiceField(theme?.checkboxRow, theme?.checkbox);

      case 'radio': {
        if (!options) {
          return formatChoiceField(theme?.radioRow, theme?.radio);
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
            formatClassName(theme?.radioOptionRow),
            [
              ...formatSelfClosingElement(
                'input',
                [
                  `id=${formatString(optionId)}`,
                  'type="radio"',
                  ...formatThemeClassName(theme?.radio, attributes),
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
              ...formatLabel(
                optionId,
                optionLabel,
                false,
                optionIndent,
                theme,
                theme?.labelAfterControl
              ),
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
                  formatClassName(theme?.legend),
                  field.label,
                  isRequired,
                  childIndent + INDENT,
                  theme
                )
              : []),
            ...optionBlocks,
          ],
          childIndent
        );
      }
    }
  };

  const errorClassName =
    field.type === 'checkbox' || field.type === 'radio'
      ? theme?.error
      : theme?.gridError;

  return formatContainer(
    'div',
    formatClassName(theme?.field),
    [
      ...formatControl(),
      `${childIndent}{${errorRef} && (`,
      ...formatContainer(
        'p',
        [
          `id=${formatString(errorId)}`,
          ...formatClassName(errorClassName),
          'role="alert"',
        ],
        [`${childIndent}${INDENT}${INDENT}{${errorRef}.message}`],
        childIndent + INDENT
      ),
      `${childIndent})}`,
    ],
    indent
  );
};

const formatButton = (
  button: FormButton,
  usedHandlers: Set<string>,
  indent: string,
  theme?: FormTheme
) => {
  const { text, type = 'button', ...attributes } = button;
  const implicitReset =
    type === 'reset' && !attributes.onClick
      ? [`onClick={${formatHandlerReference('reset', usedHandlers)}}`]
      : [];

  return formatTextElement(
    'button',
    [
      `type="${type}"`,
      ...formatThemeClassName(
        type === 'submit' ? theme?.submitButton : theme?.button,
        attributes
      ),
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

const formatUseWatch = ({ id, variableName, defaultValue }: WatchedDate) => {
  const options = [
    'control',
    `name: ${JSON.stringify(id)}`,
    ...(defaultValue === undefined
      ? []
      : [`defaultValue: ${JSON.stringify(defaultValue)}`]),
  ];
  const line = `  const ${variableName} = useWatch({ ${options.join(', ')} });`;

  return line.length <= MAX_LINE_LENGTH
    ? [line]
    : [
        `  const ${variableName} = useWatch({`,
        ...options.map((option) => `    ${option},`),
        '  });',
      ];
};

const formatUseForm = (
  hasFields: boolean,
  usesReset: boolean,
  usesControl: boolean
) => {
  const names = [
    ...(hasFields ? ['register'] : []),
    ...(usesControl ? ['control'] : []),
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

export const generateFormCode = (
  config: FormConfig,
  theme?: FormTheme
): string => {
  const usedHandlers = new Set<string>();
  const watchedDates: WatchedDate[] = [];
  const bodyIndent = INDENT.repeat(3);

  const blocks = [
    formatTextElement(
      'h2',
      ['id="form-title"', ...formatClassName(theme?.title)],
      [formatJsxText(config.title || 'Generated form')],
      bodyIndent
    ),
    ...config.items.map((field, index) =>
      formatField(field, index, usedHandlers, bodyIndent, watchedDates, theme)
    ),
  ];

  if (config.buttons.length) {
    blocks.push(
      formatContainer(
        'div',
        formatClassName(theme?.buttons),
        config.buttons.flatMap((button) =>
          formatButton(button, usedHandlers, bodyIndent + INDENT, theme)
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
    `import { ${usesGet ? 'get, ' : ''}useForm${watchedDates.length ? ', useWatch' : ''} } from "react-hook-form";`,
    '',
    'type FormValues = Record<string, string | number | boolean>;',
    '',
    'export const GeneratedForm = () => {',
    ...formatUseForm(
      config.items.length > 0,
      usesReset,
      watchedDates.length > 0
    ),
    ...watchedDates.flatMap(formatUseWatch),
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
        ...formatClassName(theme?.form),
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
