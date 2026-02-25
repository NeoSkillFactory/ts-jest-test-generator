export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
}

export class UserService {
  constructor(private repo: UserRepository) {}

  async getUser(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.repo.findAll();
  }

  async createUser(name: string, email: string): Promise<void> {
    const user: User = { id: Date.now().toString(), name, email };
    await this.repo.save(user);
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

export function formatUserName(user: User): string {
  return `${user.name} <${user.email}>`;
}
