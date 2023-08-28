module.exports = {
  config: {
    connector: {
      // 3-32 characters
      id: '6d9608fe4d9945abb92d45a48fc45ffc',
      name: 'Waldek Mastykarz (blog)',
      description: 'Tips and best practices for building applications on Microsoft 365 by Waldek Mastykarz - Microsoft 365 Cloud Developer Advocate',
      schema: [
        {
          name: 'title',
          type: 'String',
          isQueryable: 'true',
          isSearchable: 'true',
          isRetrievable: 'true',
          labels: [
            'title'
          ]
        },
        {
          name: 'excerpt',
          type: 'String',
          isQueryable: 'true',
          isSearchable: 'true',
          isRetrievable: 'true'
        },
        {
          name: 'date',
          type: 'DateTime',
          isQueryable: 'true',
          isRetrievable: 'true',
          isRefinable: 'true',
          labels: [
            'lastModifiedDateTime'
          ]
        },
        {
          name: 'tags',
          type: 'StringCollection',
          isQueryable: 'true',
          isRetrievable: 'true',
          isRefinable: 'true'
        }
      ]
    }
  }
};
