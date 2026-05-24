import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from 'typesense';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export interface EquipmentDocument {
  id: string;
  equipment: string;
  site: string;
}

@Injectable()
export class TypesenseService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(TypesenseService.name);

  constructor() {
    this.client = new Client({
      nodes: [
        {
          host: 'localhost',
          port: 8108,
          protocol: 'http',
        },
      ],
      apiKey: 'SuperSecretKey123',
      connectionTimeoutSeconds: 2,
    });
  }

  async onModuleInit() {
    await this.initSchema();
  }

  async resetAndCreateCollection() {
    const collectionName = 'equipment';
    try {
      await this.client.collections(collectionName).delete();
      console.log(`[Typesense] Successfully dropped old collection: ${collectionName}`);
    } catch (error) {
      console.log(`[Typesense] Collection didn't exist yet, proceeding to create.`);
    }

    const schema: any = {
      name: collectionName,
      fields: [
        { name: 'id', type: 'string' },
        { 
          name: 'equipment', 
          type: 'string', 
          facet: true 
        },
        { 
          name: 'site', 
          type: 'string', 
          facet: true 
        }
      ],
    };

    await this.client.collections().create(schema);
    console.log(`[Typesense] Successfully created new collection: ${collectionName} with facets!`);
  }

  private async initSchema() {
    const schema: CollectionCreateSchema = {
      name: 'equipment',
      fields: [
        { name: 'id', type: 'string' }, 
        { name: 'equipment', type: 'string', facet: true  },
        { name: 'site', type: 'string', facet: true }, 
      ],
    };

    try {
      await this.client.collections('equipment').retrieve();
      this.logger.log('Typesense collection "equipment" is ready.');
    } catch (error) {
      this.logger.log('Creating Typesense collection "equipment"...');
      await this.client.collections().create(schema);
    }
  }

  async upsertEquipment(data: { id: number; equipment: string; site: string }) {
    try {
      await this.client.collections<EquipmentDocument>('equipment').documents().upsert({
        id: data.id.toString(),
        equipment: data.equipment,
        site: data.site,
      });
    } catch (error) {
      this.logger.error('Error upserting to Typesense', error);
    }
  }

async searchEquipment(searchQuery: string, site?: string): Promise<string[]> {
    const isWildcard = !searchQuery || searchQuery.trim() === '' || searchQuery === '*';

    if (isWildcard) {
      const params: any = {
        q: '*',
        query_by: 'equipment',
        facet_by: 'equipment',
        max_facet_values: 1000, 
        per_page: 0,            
      };

      if (site && site !== 'all') {
        params.filter_by = `site:=${site}`;
      }

      const result = await this.client
        .collections('equipment')
        .documents()
        .search(params);

      const names = result.facet_counts?.[0]?.counts?.map((f: any) => f.value) ?? [];
      
      return names.sort((a, b) => a.localeCompare(b));
    }

    const params: any = {
      q: searchQuery,
      query_by: 'equipment',
      group_by: 'equipment',
      group_limit: 1,
      per_page: 250,
    };

    if (site && site !== 'all') {
      params.filter_by = `site:=${site}`;
    }

    const allNames = new Set<string>();
    let currentPage = 1;

    while (true) {
      const result = await this.client
        .collections('equipment')
        .documents()
        .search({ ...params, page: currentPage });

      if (!result.grouped_hits?.length) break;
      result.grouped_hits.forEach((g: any) => allNames.add(g.group_key[0]));
      if (result.grouped_hits.length < 250) break;
      currentPage++;
    }

    const finalNames = Array.from(allNames);
    
    return finalNames.sort((a, b) => a.localeCompare(b));
  }
}  

  // async searchEquipment(searchQuery: string, site?: string) {
  //   const searchParameters: any = {
  //     q: searchQuery,
  //     query_by: 'equipment',
  //     per_page: 20,
  //   };

  //   if (site && site !== 'all') {
  //     searchParameters.filter_by = `site:=${site}`;
  //   }

  //   const searchResults = await this.client
  //     .collections<EquipmentDocument>('equipment')
  //     .documents()
  //     .search(searchParameters);
    
  //   return searchResults.hits?.map(hit => hit.document.equipment) || [];
  // }

// async searchEquipmentNames(searchQuery: string, site?: string): Promise<string[]> {
  //   const searchParameters: any = {
  //     q: searchQuery,
  //     query_by: 'equipment',
  //     group_by: 'equipment',
  //     group_limit: 1, 
  //     per_page: 50,   
  //   };

  //   if (site && site !== 'all') {
  //     searchParameters.filter_by = `site:=${site}`;
  //   }

  //   const searchResults = await this.client
  //     .collections<EquipmentDocument>('equipment')
  //     .documents()
  //     .search(searchParameters);
    
  //   if (!searchResults.grouped_hits || searchResults.grouped_hits.length === 0) {
  //     return [];
  //   }

  //   return searchResults.grouped_hits.map(group => group.group_key[0]);
  // }