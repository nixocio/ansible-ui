import {
  Button,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { Select, SelectOption, SelectList } from '@patternfly/react-core/next';
import { TimesIcon } from '@patternfly/react-icons';
import { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

export interface PageSelectOption<T> {
  label: string;
  description?: string;
  value: T;
  isDisabled?: boolean;
}

export enum PageSelectVariant {
  Single = 'Single',
  Typeahead = 'Typeahead',
}

type PageSelectVariants = keyof typeof PageSelectVariant;

interface PageSingleSelectProps<T> {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: PageSelectOption<T>[];
  placeholder?: string;
  icon?: ReactNode;
  variant?: PageSelectVariants;
}

/** Single select for the page framework. */
export function PageSingleSelect<T>(props: PageSingleSelectProps<T>) {
  const { t } = useTranslation();
  const { value, onChange, options, placeholder, variant = PageSelectVariant.Single } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selected, setSelected] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState(options);

  let selectedOption: PageSelectOption<T> | undefined = undefined;
  for (const option of options) {
    if (value === option.value) {
      selectedOption = option;
      break;
    }
  }

  useEffect(() => {
    let newSelectOptions = options;

    // Filter menu items based on the text input value when one exists
    if (filterValue && variant === PageSelectVariant.Typeahead) {
      newSelectOptions = options.filter((menuItem) =>
        String(menuItem.label).toLowerCase().includes(filterValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [{ isDisabled: true, label: t('No results found'), value: 'not_found' }];
      }
    }

    setSelectOptions(newSelectOptions);
  }, [filterValue, options, t, variant]);

  const Toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={props.id}
      ref={toggleRef}
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
      style={{ width: '100%', minWidth: 100 }}
    >
      {props.icon && <span style={{ paddingLeft: 4, paddingRight: 12 }}>{props.icon}</span>}
      {selectedOption ? selectedOption.label : <PlacedholderSpan>{placeholder}</PlacedholderSpan>}
    </MenuToggle>
  );

  const TypeAheadToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={props.id}
      ref={toggleRef}
      variant="typeahead"
      onClick={() => setIsOpen((open) => !open)}
      isExpanded={isOpen}
      style={{ width: '100%', minWidth: 100 }}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={() => setIsOpen((open) => !open)}
          onChange={onTextInputChange}
          id="typeahead-select-input"
          autoComplete="off"
          placeholder={selectedOption ? selectedOption?.label : placeholder}
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                setSelected('');
                setInputValue('');
                setFilterValue('');
              }}
              aria-label={t('Clear input value')}
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const singleSelectOnSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: string | number | undefined
  ) => {
    const newSelectedOption = options.find((option) => option.label === itemId);
    if (newSelectedOption) {
      onChange(newSelectedOption.value);
      setIsOpen(false);
    }
  };

  const typeahedSelectOnSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: string | number | undefined
  ) => {
    const newSelectedOption = options.find((option) => option.label === itemId);

    if (newSelectedOption) {
      onChange(newSelectedOption.value);
      setIsOpen(false);
    }

    if (itemId) {
      setInputValue(itemId as string);
      setFilterValue(itemId as string);
      setSelected(itemId as string);
    }
  };

  if (variant === PageSelectVariant.Single) {
    return (
      <Select
        selected={value}
        onSelect={singleSelectOnSelect}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        toggle={Toggle}
        style={{ zIndex: isOpen ? 9999 : undefined }}
      >
        <SelectList>
          {options.map((option) => (
            <SelectOption
              description={option.description}
              isDisabled={option.isDisabled}
              itemId={option.label}
              key={option.label}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    );
  }
  return (
    <Select
      id="typeahead-select"
      isOpen={isOpen}
      selected={selected}
      onSelect={typeahedSelectOnSelect}
      onOpenChange={() => {
        setIsOpen(false);
        setFilterValue('');
      }}
      toggle={TypeAheadToggle}
    >
      <SelectList>
        {selectOptions.map((option) => (
          <SelectOption
            description={option.description}
            isDisabled={option.isDisabled}
            itemId={option.label}
            key={option.label}
            onClick={() => setSelected(option.label)}
          >
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}

const PlacedholderSpan = styled.span`
  color: var(--pf-global--Color--dark-200);
`;
