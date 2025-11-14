

import { FormFieldConfig } from './types';

export const FORM_CONFIG: FormFieldConfig[] = [
    // --- EVENT TYPE & TICKET TYPE (Nested Dependencies) ---
    {
        "variant": "Combobox",
        "name": "event_type",
        "label": "Event Type",
        "description": "Select the type of event you are registering for.",
        "placeholder": "Choose an event type...",
        "required": true,
        "options": [
            { "label": "Conference", "value": "conference" },
            { "label": "Workshop", "value": "workshop" },
            { "label": "Webinar", "value": "webinar" }
        ],
        // Default properties
        "rowIndex": 0, "disabled": false, "type": ""
    },
    {
        "variant": "RadioGroup",
        "name": "ticket_type",
        "label": "Ticket Type",
        "description": "Choose your access level for the conference.",
        "required": true,
        // FIX: Added missing placeholder property.
        "placeholder": "",
        "options": [
            { "label": "General Admission ($100)", "value": "general" },
            { "label": "VIP ($250)", "value": "vip" },
            { "label": "Student ($50)", "value": "student" }
        ],
        "conditions": [{ "field": "event_type", "operator": "equals", "value": "conference" }],
        "isComplex": true,
        "rowIndex": 1, "disabled": false, "type": ""
    },
    {
        "variant": "CheckboxGroup",
        "name": "vip_perks",
        "label": "VIP Perks",
        "description": "Select additional perks available to VIPs.",
        "required": false,
        // FIX: Added missing placeholder property.
        "placeholder": "",
        "options": [
            { "label": "Gala Dinner", "value": "gala_dinner" },
            { "label": "Swag Bag", "value": "swag_bag" },
            { "label": "Speaker Meet & Greet", "value": "meet_greet" }
        ],
        "conditions": [{
            "AND": [
                { "field": "event_type", "operator": "equals", "value": "conference" },
                { "field": "ticket_type", "operator": "equals", "value": "vip" }
            ]
        }],
        "isComplex": true,
        "rowIndex": 2, "disabled": false, "type": ""
    },
    {
        "variant": "Textarea",
        "name": "dietary_restrictions",
        "label": "Dietary Restrictions",
        "description": "Please list any dietary restrictions for the Gala Dinner.",
        "placeholder": "e.g., Vegetarian, Gluten-Free",
        "required": false, // This will be dynamically changed
        "conditions": [{
            "AND": [
                { "field": "ticket_type", "operator": "equals", "value": "vip" },
                { "field": "vip_perks", "operator": "isChecked", "value": "gala_dinner" }
            ]
        }],
        "dynamicProps": [{
            "property": "required",
            "value": true,
            "conditions": [{ "field": "vip_perks", "operator": "isChecked", "value": "gala_dinner" }]
        }],
        "isComplex": true,
        "rowIndex": 3, "disabled": false, "type": ""
    },
    // --- WORKSHOP DETAILS (Dynamic Options) ---
    {
        "variant": "Select",
        "name": "workshop_topic",
        "label": "Workshop Topic",
        "description": "Which workshop would you like to attend?",
        "required": true,
        // FIX: Added missing placeholder property.
        "placeholder": "Choose a workshop topic...",
        "options": [
            { "label": "Advanced React Patterns", "value": "advanced_react" },
            { "label": "Introduction to Svelte", "value": "intro_svelte" }
        ],
        "conditions": [{ "field": "event_type", "operator": "equals", "value": "workshop" }],
        "rowIndex": 4, "disabled": false, "type": ""
    },
    {
        "variant": "Select",
        "name": "workshop_session",
        "label": "Workshop Session",
        "description": "Select a time slot for your chosen workshop.",
        "required": true,
        "placeholder": "First, select a topic",
        "conditions": [{ "field": "workshop_topic", "operator": "isNotEmpty" }],
        "optionsSource": {
            "field": "workshop_topic",
            "mapping": {
                "advanced_react": [
                    { "label": "Session A: 9am - 12pm", "value": "react_a" },
                    { "label": "Session B: 1pm - 4pm", "value": "react_b" }
                ],
                "intro_svelte": [
                    { "label": "Session C: 9am - 12pm", "value": "svelte_c" },
                    { "label": "Session D: 1pm - 4pm", "value": "svelte_d" }
                ]
            }
        },
        "rowIndex": 5, "disabled": false, "type": ""
    },
    // --- REGISTRANT INFORMATION (Compound Conditions) ---
    {
        "variant": "Input",
        "name": "registrant_name",
        "label": "Full Name",
        "description": "Enter the full name of the attendee.",
        "placeholder": "John Doe",
        "required": true,
        "rowIndex": 6, "disabled": false, "type": ""
    },
    {
        "variant": "Input",
        "name": "registrant_username",
        "label": "Username",
        "description": "Choose a unique username for the event app.",
        "placeholder": "john.doe",
        "required": true,
        "validationRules": [{ "type": "unique", "message": "This username is already taken." }],
        "rowIndex": 7, "disabled": false, "type": ""
    },
    {
        "variant": "Textarea",
        "name": "special_assistance",
        "label": "Special Assistance",
        "description": "Please describe any special assistance you may require.",
        "required": false,
        // FIX: Added missing placeholder property.
        "placeholder": "e.g. wheelchair access",
        "conditions": [{
            "OR": [
                { "AND": [
                    { "field": "event_type", "operator": "equals", "value": "conference" },
                    { "field": "ticket_type", "operator": "equals", "value": "vip" }
                ]},
                { "field": "event_type", "operator": "equals", "value": "workshop" }
            ]
        }],
        "rowIndex": 8, "disabled": false, "type": ""
    },
    // --- BILLING INFORMATION (Group Visibility) ---
    {
        "variant": "Input",
        "name": "billing_company",
        "label": "Company Name",
        "description": "Company name for the invoice.",
        "placeholder": "ACME Corporation",
        "required": false,
        "conditions": [{ "field": "ticket_type", "operator": "notEquals", "value": "student" }],
        "isComplex": true,
        "rowIndex": 9, "disabled": false, "type": ""
    },
    {
        "variant": "Input",
        "name": "billing_vat",
        "label": "VAT Number",
        "description": "VAT number for tax purposes.",
        "placeholder": "EU123456789",
        "required": false,
        "conditions": [{ "field": "ticket_type", "operator": "notEquals", "value": "student" }],
        "isComplex": true,
        "rowIndex": 10, "disabled": false, "type": ""
    }
];