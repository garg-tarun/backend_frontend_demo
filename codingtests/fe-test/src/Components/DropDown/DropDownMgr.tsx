import { useEffect, useRef, MutableRefObject } from 'react';

type DropdownEntry = {
  ref: MutableRefObject<HTMLElement | null>;
  setIsOpen: (open: boolean) => void;
};

// Track all registered dropdowns in a Set
const dropdownRefs = new Set<DropdownEntry>();

export function useRegisterDropdown(setIsOpen: (open: boolean) => void): MutableRefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const entry = { ref, setIsOpen };
    dropdownRefs.add(entry);

    return () => {
      dropdownRefs.delete(entry);
    };
  }, [setIsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideAny = Array.from(dropdownRefs).some(({ ref }) =>
        ref.current && ref.current.contains(event.target as Node)
      );

      if (!clickedInsideAny) {
        dropdownRefs.forEach(({ setIsOpen }) => setIsOpen(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return ref;
}

