import { randomUUID } from 'crypto';

export interface PastoralInscricao {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  createdAt: string;
}

export interface PastoralPost {
  id: string;
  title: string;
  content?: string;
  images: string[];
  eventDate?: string;
  createdAt: string;
}

export interface Pastoral {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  coordinator?: string;
  contact?: string;
  email?: string;
  passwordHash?: string;
  createdAt: string;
  posts: PastoralPost[];
  inscricoes: PastoralInscricao[];
}

export interface PastoraisData {
  pastorais: Pastoral[];
}

export const defaultPastoraisData: PastoraisData = {
  pastorais: [
    {
      id: randomUUID(),
      name: 'Pastoral da Criança',
      slug: 'pastoral-da-crianca',
      description:
        'Acompanha gestantes e crianças de 0 a 6 anos com ações de saúde, nutrição, educação e cidadania, levando o amor de Deus às famílias da comunidade.',
      coordinator: '',
      contact: '',
      createdAt: new Date().toISOString(),
      posts: [],
      inscricoes: [],
    },
    {
      id: randomUUID(),
      name: 'ECC - Encontro de Casais com Cristo',
      slug: 'ecc-encontro-de-casais-com-cristo',
      description:
        'Movimento de evangelização que reúne casais para o crescimento espiritual, vivência do sacramento do matrimônio e partilha da fé em comunidade.',
      coordinator: '',
      contact: '',
      createdAt: new Date().toISOString(),
      posts: [],
      inscricoes: [],
    },
    {
      id: randomUUID(),
      name: 'Apostolado da Oração',
      slug: 'apostolado-da-oracao',
      description:
        'Movimento dedicado à oração, consagração ao Sagrado Coração de Jesus e intercessão pelas intenções da Igreja e do mundo.',
      coordinator: '',
      contact: '',
      createdAt: new Date().toISOString(),
      posts: [],
      inscricoes: [],
    },
    {
      id: randomUUID(),
      name: 'Terço dos Homens',
      slug: 'terco-dos-homens',
      description:
        'Encontros de oração do Santo Terço reunindo os homens da comunidade para rezar, partilhar e fortalecer a fé em família.',
      coordinator: '',
      contact: '',
      createdAt: new Date().toISOString(),
      posts: [],
      inscricoes: [],
    },
    {
      id: randomUUID(),
      name: 'Mães que Oram pelos Filhos',
      slug: 'maes-que-oram-pelos-filhos',
      description:
        'Grupo de mães que se reúnem para rezar pelos filhos, pelas famílias e pelas vocações, unidas na fé e na esperança.',
      coordinator: '',
      contact: '',
      createdAt: new Date().toISOString(),
      posts: [],
      inscricoes: [],
    },
    {
      id: randomUUID(),
      name: 'Movimento Serra',
      slug: 'movimento-serra',
      description:
        'Movimento vocacional que atua na animação e promoção das vocações sacerdotais e religiosas dentro da comunidade paroquial.',
      coordinator: '',
      contact: '',
      createdAt: new Date().toISOString(),
      posts: [],
      inscricoes: [],
    },
  ],
};
