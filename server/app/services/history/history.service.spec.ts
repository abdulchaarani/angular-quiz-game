import { HistoryItem, HistoryItemDocument } from '@app/model/database/history-item';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { HistoryService } from './history.service';

// TODO: ComputeBestScore and createHistoryItem tests
describe('HistoryService', () => {
    let service: HistoryService;
    let historyModel: Model<HistoryItemDocument>;

    beforeEach(async () => {
        historyModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
            deleteMany: jest.fn(),
        } as unknown as Model<HistoryItemDocument>;
        const module: TestingModule = await Test.createTestingModule({
            providers: [HistoryService, { provide: getModelToken(HistoryItem.name), useValue: historyModel }],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getHistory() should return all history items in database', async () => {
        const mockHistory = [new HistoryItem(), new HistoryItem()];
        const spyFind = jest.spyOn(historyModel, 'find').mockResolvedValue(mockHistory);
        const returnedHistory = await service.getHistory();
        expect(spyFind).toHaveBeenCalledWith({});
        expect(returnedHistory).toEqual(mockHistory);
    });

    it('addHistoryItem() should add the history item to the database', async () => {
        const mockHistory = new HistoryItem();
        const spyCreate = jest.spyOn(historyModel, 'create').mockImplementation();
        service.addHistoryItem(mockHistory);
        expect(spyCreate).toHaveBeenCalledWith(mockHistory);
    });

    it('deleteHistory() should delete the entire history from the database', async () => {
        const spyDelete = jest.spyOn(historyModel, 'deleteMany').mockImplementation();
        service.deleteHistory();
        expect(spyDelete).toHaveBeenCalledWith({});
    });
});
