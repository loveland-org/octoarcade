/**
 * Configuration Validator and Size Limiter
 * 
 * This module provides validation and size limits for arcade cabinet
 * configuration files to ensure security and prevent resource exhaustion.
 */

// Configuration size limits
const SIZE_LIMITS = {
  MAX_CONFIG_SIZE: 10 * 1024 * 1024, // 10MB max per configuration
  MAX_GAMES_PER_CABINET: 500,         // Maximum games per cabinet
  MAX_NAME_LENGTH: 100,               // Maximum name field length
  MAX_DESCRIPTION_LENGTH: 1000,       // Maximum description length
  MAX_PATH_LENGTH: 500,               // Maximum file path length
  MAX_NESTED_DEPTH: 10                // Maximum object nesting depth
};

// Valid configuration schema fields
const VALID_FIELDS = {
  cabinet: ['id', 'name', 'description', 'games', 'settings', 'createdAt', 'updatedAt', 'metadata'],
  game: ['id', 'name', 'path', 'thumbnail', 'description', 'controls', 'settings'],
  settings: ['volume', 'brightness', 'controls', 'display', 'network']
};

/**
 * Configuration validation error
 */
class ConfigurationValidationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ConfigurationValidationError';
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
}

/**
 * Configuration Validator class
 */
class ConfigurationValidator {
  constructor(options = {}) {
    this.limits = { ...SIZE_LIMITS, ...options.limits };
    this.validFields = { ...VALID_FIELDS, ...options.validFields };
    this.strictMode = options.strictMode || false;
  }

  /**
   * Validates a complete configuration
   * @param {Object|string} config - Configuration object or JSON string
   * @returns {Object} Validation result with success status and errors
   */
  validate(config) {
    const errors = [];
    const warnings = [];
    let parsedConfig;

    // Parse JSON if string provided
    if (typeof config === 'string') {
      const parseResult = this.parseConfig(config);
      if (!parseResult.success) {
        return parseResult;
      }
      parsedConfig = parseResult.config;
    } else {
      parsedConfig = config;
    }

    // Validate size
    const sizeResult = this.validateSize(parsedConfig);
    if (!sizeResult.valid) {
      errors.push(sizeResult.error);
    }

    // Validate structure
    const structureResult = this.validateStructure(parsedConfig);
    errors.push(...structureResult.errors);
    warnings.push(...structureResult.warnings);

    // Validate cabinet fields
    if (parsedConfig.cabinet || parsedConfig.id) {
      const cabinetResult = this.validateCabinet(parsedConfig.cabinet || parsedConfig);
      errors.push(...cabinetResult.errors);
      warnings.push(...cabinetResult.warnings);
    }

    // Check nesting depth
    const depthResult = this.validateNestingDepth(parsedConfig);
    if (!depthResult.valid) {
      errors.push(depthResult.error);
    }

    return {
      success: errors.length === 0,
      valid: errors.length === 0,
      errors,
      warnings,
      config: parsedConfig
    };
  }

  /**
   * Parses a JSON configuration string safely
   * @param {string} configString - JSON string to parse
   * @returns {Object} Parse result
   */
  parseConfig(configString) {
    try {
      // Check size before parsing
      if (configString.length > this.limits.MAX_CONFIG_SIZE) {
        return {
          success: false,
          error: new ConfigurationValidationError(
            `Configuration string exceeds maximum size of ${this.limits.MAX_CONFIG_SIZE} bytes`,
            'SIZE_EXCEEDED',
            { size: configString.length, limit: this.limits.MAX_CONFIG_SIZE }
          )
        };
      }

      const config = JSON.parse(configString);
      return { success: true, config };
    } catch (e) {
      return {
        success: false,
        error: new ConfigurationValidationError(
          `Invalid JSON: ${e.message}`,
          'PARSE_ERROR',
          { parseError: e.message }
        )
      };
    }
  }

  /**
   * Validates configuration size
   * @param {Object} config - Configuration object
   * @returns {Object} Validation result
   */
  validateSize(config) {
    const jsonSize = JSON.stringify(config).length;
    if (jsonSize > this.limits.MAX_CONFIG_SIZE) {
      return {
        valid: false,
        error: new ConfigurationValidationError(
          `Configuration size ${jsonSize} bytes exceeds limit of ${this.limits.MAX_CONFIG_SIZE} bytes`,
          'SIZE_EXCEEDED',
          { size: jsonSize, limit: this.limits.MAX_CONFIG_SIZE }
        )
      };
    }
    return { valid: true, size: jsonSize };
  }

  /**
   * Validates configuration structure
   * @param {Object} config - Configuration object
   * @returns {Object} Validation result with errors and warnings
   */
  validateStructure(config) {
    const errors = [];
    const warnings = [];

    if (typeof config !== 'object' || config === null) {
      errors.push(new ConfigurationValidationError(
        'Configuration must be a non-null object',
        'INVALID_TYPE'
      ));
      return { errors, warnings };
    }

    // Check for required fields
    if (!config.id && !config.cabinet?.id) {
      errors.push(new ConfigurationValidationError(
        'Configuration must have an id field',
        'MISSING_FIELD',
        { field: 'id' }
      ));
    }

    if (!config.name && !config.cabinet?.name) {
      errors.push(new ConfigurationValidationError(
        'Configuration must have a name field',
        'MISSING_FIELD',
        { field: 'name' }
      ));
    }

    return { errors, warnings };
  }

  /**
   * Validates cabinet-specific fields
   * @param {Object} cabinet - Cabinet configuration
   * @returns {Object} Validation result
   */
  validateCabinet(cabinet) {
    const errors = [];
    const warnings = [];

    // Validate name length
    if (cabinet.name && cabinet.name.length > this.limits.MAX_NAME_LENGTH) {
      errors.push(new ConfigurationValidationError(
        `Cabinet name exceeds maximum length of ${this.limits.MAX_NAME_LENGTH} characters`,
        'FIELD_TOO_LONG',
        { field: 'name', length: cabinet.name.length, limit: this.limits.MAX_NAME_LENGTH }
      ));
    }

    // Validate description length
    if (cabinet.description && cabinet.description.length > this.limits.MAX_DESCRIPTION_LENGTH) {
      warnings.push(new ConfigurationValidationError(
        `Cabinet description exceeds recommended length of ${this.limits.MAX_DESCRIPTION_LENGTH} characters`,
        'FIELD_TOO_LONG',
        { field: 'description', length: cabinet.description.length, limit: this.limits.MAX_DESCRIPTION_LENGTH }
      ));
    }

    // Validate games array
    if (cabinet.games) {
      if (!Array.isArray(cabinet.games)) {
        errors.push(new ConfigurationValidationError(
          'Games must be an array',
          'INVALID_TYPE',
          { field: 'games' }
        ));
      } else if (cabinet.games.length > this.limits.MAX_GAMES_PER_CABINET) {
        errors.push(new ConfigurationValidationError(
          `Too many games: ${cabinet.games.length}. Maximum is ${this.limits.MAX_GAMES_PER_CABINET}`,
          'TOO_MANY_ITEMS',
          { count: cabinet.games.length, limit: this.limits.MAX_GAMES_PER_CABINET }
        ));
      } else {
        // Validate each game
        cabinet.games.forEach((game, index) => {
          const gameResult = this.validateGame(game, index);
          errors.push(...gameResult.errors);
          warnings.push(...gameResult.warnings);
        });
      }
    }

    // Check for unknown fields in strict mode
    if (this.strictMode) {
      const unknownFields = Object.keys(cabinet).filter(
        key => !this.validFields.cabinet.includes(key)
      );
      if (unknownFields.length > 0) {
        warnings.push(new ConfigurationValidationError(
          `Unknown cabinet fields: ${unknownFields.join(', ')}`,
          'UNKNOWN_FIELDS',
          { fields: unknownFields }
        ));
      }
    }

    return { errors, warnings };
  }

  /**
   * Validates a game configuration
   * @param {Object} game - Game configuration
   * @param {number} index - Game index in array
   * @returns {Object} Validation result
   */
  validateGame(game, index) {
    const errors = [];
    const warnings = [];

    if (typeof game !== 'object' || game === null) {
      errors.push(new ConfigurationValidationError(
        `Game at index ${index} must be an object`,
        'INVALID_TYPE',
        { index }
      ));
      return { errors, warnings };
    }

    if (!game.id) {
      errors.push(new ConfigurationValidationError(
        `Game at index ${index} must have an id`,
        'MISSING_FIELD',
        { field: 'id', index }
      ));
    }

    if (!game.name) {
      errors.push(new ConfigurationValidationError(
        `Game at index ${index} must have a name`,
        'MISSING_FIELD',
        { field: 'name', index }
      ));
    }

    if (game.path && game.path.length > this.limits.MAX_PATH_LENGTH) {
      errors.push(new ConfigurationValidationError(
        `Game path at index ${index} exceeds maximum length`,
        'FIELD_TOO_LONG',
        { field: 'path', index, length: game.path.length, limit: this.limits.MAX_PATH_LENGTH }
      ));
    }

    return { errors, warnings };
  }

  /**
   * Validates nesting depth to prevent stack overflow
   * @param {Object} obj - Object to check
   * @param {number} currentDepth - Current nesting depth
   * @returns {Object} Validation result
   */
  validateNestingDepth(obj, currentDepth = 0) {
    if (currentDepth > this.limits.MAX_NESTED_DEPTH) {
      return {
        valid: false,
        error: new ConfigurationValidationError(
          `Object nesting exceeds maximum depth of ${this.limits.MAX_NESTED_DEPTH}`,
          'NESTING_TOO_DEEP',
          { depth: currentDepth, limit: this.limits.MAX_NESTED_DEPTH }
        )
      };
    }

    if (typeof obj !== 'object' || obj === null) {
      return { valid: true };
    }

    const values = Array.isArray(obj) ? obj : Object.values(obj);
    for (const value of values) {
      if (typeof value === 'object' && value !== null) {
        const result = this.validateNestingDepth(value, currentDepth + 1);
        if (!result.valid) {
          return result;
        }
      }
    }

    return { valid: true };
  }

  /**
   * Sanitizes a configuration by removing invalid or dangerous content
   * @param {Object} config - Configuration to sanitize
   * @returns {Object} Sanitized configuration
   */
  sanitize(config) {
    const sanitized = JSON.parse(JSON.stringify(config));

    // Trim string fields
    const trimStrings = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          trimStrings(obj[key]);
        }
      }
    };

    trimStrings(sanitized);

    // Truncate overly long strings
    if (sanitized.name && sanitized.name.length > this.limits.MAX_NAME_LENGTH) {
      sanitized.name = sanitized.name.substring(0, this.limits.MAX_NAME_LENGTH);
    }

    if (sanitized.description && sanitized.description.length > this.limits.MAX_DESCRIPTION_LENGTH) {
      sanitized.description = sanitized.description.substring(0, this.limits.MAX_DESCRIPTION_LENGTH);
    }

    return sanitized;
  }
}

// Export for both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConfigurationValidator, ConfigurationValidationError, SIZE_LIMITS };
}
