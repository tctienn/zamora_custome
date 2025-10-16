type Resolvers = { [key: string]: any };

class TemplateProcessor {
  private resolvers: Resolvers;

  constructor(resolvers: Resolvers) {
    this.resolvers = resolvers;
  }

  process(template: string): string {
    const regex = /\$\{(\w+)(?:,([^}]+))?}/g; // Matches ${variable,format} or ${variable}

    return template.replace(regex, (_, key: string, format: string | undefined) => {
      const value = this.resolvers[key];
      if (value === undefined) {
        throw new Error(`Unknown variable: ${key}`);
      }
      return this.formatValue(value, format);
    });
  }

  private formatValue(value: any, format?: string): string {
    if (typeof value === 'number') {
      if (format) {
        const width = parseInt(format, 10);
        return value.toString().padStart(width, '0');
      }
      return value.toString();
    }

    if (value instanceof Date) {
      if (format) {
        // Date formatting using Intl.DateTimeFormat
        return new Intl.DateTimeFormat('en-US', this.parseDateFormat(format)).format(value);
      }
      return value.toISOString();
    }

    return value.toString();
  }

  private parseDateFormat(format: string): Intl.DateTimeFormatOptions {
    // Simple parser for "MM/dd" -> { month: '2-digit', day: '2-digit' }
    const options: Intl.DateTimeFormatOptions = {};
    if (format.includes('MM')) {
      options.month = '2-digit';
    }
    if (format.includes('dd')) {
      options.day = '2-digit';
    }
    if (format.includes('yyyy')) {
      options.year = 'numeric';
    }
    return options;
  }
}
