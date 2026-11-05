import { JpaRepository } from './JpaRepository.ts';
import { district } from './model.ts';

export class DistrictRepository extends JpaRepository<typeof district> {
    constructor() {
        super(district);
    }
}
