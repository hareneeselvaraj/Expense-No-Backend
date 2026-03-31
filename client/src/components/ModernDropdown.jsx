import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import useDeviceDetect from '../hooks/useDeviceDetect';

const ModernDropdown = ({ value, onChange, options, style, className, disabled, placeholder = 'Select...' }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const { isMobile } = useDeviceDetect(768);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const selectedOption = options.find(o => String(o.value) === String(value));

    return (
        <div ref={wrapperRef} className={`modern-dropdown-wrapper ${className || ''}`} style={{ position: 'relative', ...style }}>
            <div
                className={`modern-dropdown-trigger ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    width: '100%'
                }}
            >
                <span className="modern-dropdown-value">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiChevronDown className={`modern-dropdown-chevron ${open ? 'open' : ''}`} />
            </div>

            {open && isMobile && (
                <div className="custom-dropdown-overlay" onClick={() => setOpen(false)} />
            )}

            {open && (
                <div className="custom-dropdown-menu">
                    {isMobile && (
                        <div className="bottom-sheet-header">
                            <div className="bottom-sheet-handle" />
                            <h4 className="bottom-sheet-title">{placeholder}</h4>
                        </div>
                    )}
                    <div className="dropdown-options-list">
                        {options.map((opt, i) => {
                            const isSelected = String(value) === String(opt.value);
                            return (
                                <div
                                    key={i}
                                    className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                >
                                    <span className="option-label">{opt.label}</span>
                                    {isSelected && <span className="option-check">✓</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernDropdown;
